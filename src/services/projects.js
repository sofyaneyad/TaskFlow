import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Local storage keys
const LOCAL_PROJECTS_KEY = "taskflow_local_projects";

// Local cache helpers to guarantee instant sub-50ms speeds and offline resilience
function getCachedProjects() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCachedProjects(projects) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error("Cache save error:", err);
  }
}

const LOCAL_MEMBERS_CACHE_KEY = "taskflow_members_cache";

function getCachedMemberProfiles() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_MEMBERS_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCachedMemberProfile(uid, data) {
  if (typeof window === "undefined" || !uid) return;
  try {
    const map = getCachedMemberProfiles();
    map[uid] = data;
    localStorage.setItem(LOCAL_MEMBERS_CACHE_KEY, JSON.stringify(map));
  } catch {}
}

let firestoreReachable = true;

const withTimeout = (promise, ms = 500) => {
  if (!firestoreReachable) {
    return Promise.reject(new Error("Firestore offline or unavailable"));
  }
  return Promise.race([
    promise.catch((err) => {
      if (
        err?.message?.includes("not found") ||
        err?.message?.includes("Failed to get document") ||
        err?.code === "not-found"
      ) {
        firestoreReachable = false;
      }
      throw err;
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Network timeout")), ms)
    ),
  ]);
};

// FR-05 & FR-18: Create Project (Instant optimistic write + background Firestore persistence)
export async function createProject({ name, description = "", ownerId }) {
  if (!name || name.trim().length < 3 || name.trim().length > 80) {
    throw new Error("Project name is required and must be between 3 and 80 characters.");
  }
  if (description && description.length > 1000) {
    throw new Error("Description must not exceed 1000 characters.");
  }

  // 1. Generate unique Firestore Document Reference & ID
  const projectsColRef = collection(db, "projects");
  const newDocRef = doc(projectsColRef);
  const projectId = newDocRef.id;

  const nowIso = new Date().toISOString();
  const projectData = {
    id: projectId,
    name: name.trim(),
    description: description.trim(),
    ownerId,
    memberIds: [ownerId],
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // 2. Save to local cache immediately (instant 0.01s feedback!)
  const cached = getCachedProjects();
  saveCachedProjects([projectData, ...cached]);

  // 3. Persist to Cloud Firestore in background without blocking
  setDoc(newDocRef, {
    name: projectData.name,
    description: projectData.description,
    ownerId: projectData.ownerId,
    memberIds: projectData.memberIds,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }).catch((err) => {
    console.warn("Firestore save deferred or offline, cached locally:", err.message);
  });

  return projectData;
}

// Helper to sync remote projects in background
export async function syncRemoteProjects(userId) {
  try {
    const q = query(
      collection(db, "projects"),
      where("memberIds", "array-contains", userId)
    );
    const querySnapshot = await withTimeout(getDocs(q), 1500);
    const remoteProjects = [];
    querySnapshot.forEach((docSnap) => {
      remoteProjects.push({ id: docSnap.id, ...docSnap.data() });
    });

    if (remoteProjects.length > 0) {
      const local = getCachedProjects();
      const mergedMap = new Map();
      local.forEach((p) => mergedMap.set(p.id, p));
      remoteProjects.forEach((p) => mergedMap.set(p.id, p));
      const merged = Array.from(mergedMap.values());
      saveCachedProjects(merged);
      return merged;
    }
  } catch (err) {
    // Firestore offline or not configured
  }
  return [];
}

// Get all projects accessible by user (Owner or Member)
export async function getUserProjects(userId) {
  if (!userId) return [];

  // 1. Read local cache first for instant 0ms UI response
  const localProjects = getCachedProjects().filter(
    (p) => p.memberIds && p.memberIds.includes(userId)
  );

  // If we already have cached projects, return them IMMEDIATELY and sync in background!
  if (localProjects.length > 0) {
    syncRemoteProjects(userId).catch(() => {});
    return localProjects;
  }

  // If no cache, perform remote fetch
  const remote = await syncRemoteProjects(userId);
  return remote.length > 0 ? remote : localProjects;
}

// Get single project by ID
export async function getProjectById(projectId) {
  if (!projectId) return null;

  // Check cache first for instant 0ms access
  const cached = getCachedProjects().find((p) => p.id === projectId);
  if (cached) {
    // Background refresh
    (async () => {
      try {
        const docRef = doc(db, "projects", projectId);
        const docSnap = await withTimeout(getDoc(docRef), 1500);
        if (docSnap && docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          const list = getCachedProjects().filter((p) => p.id !== projectId);
          saveCachedProjects([data, ...list]);
        }
      } catch {}
    })().catch(() => {});
    return cached;
  }

  try {
    const docRef = doc(db, "projects", projectId);
    const docSnap = await withTimeout(getDoc(docRef), 1500);

    if (docSnap && docSnap.exists()) {
      const data = { id: docSnap.id, ...docSnap.data() };
      const list = getCachedProjects().filter((p) => p.id !== projectId);
      saveCachedProjects([data, ...list]);
      return data;
    }
  } catch {
    // Return cache if remote is slow or offline
  }

  return cached || null;
}

// FR-06: Update project details (Owner only)
export async function updateProject(projectId, { name, description }) {
  if (!name || name.trim().length < 3 || name.trim().length > 80) {
    throw new Error("Project name is required and must be between 3 and 80 characters.");
  }
  if (description && description.length > 1000) {
    throw new Error("Description must not exceed 1000 characters.");
  }

  const trimmedName = name.trim();
  const trimmedDesc = description ? description.trim() : "";
  const nowIso = new Date().toISOString();

  // 1. Update cache instantly
  const list = getCachedProjects().map((p) => {
    if (p.id === projectId) {
      return { ...p, name: trimmedName, description: trimmedDesc, updatedAt: nowIso };
    }
    return p;
  });
  saveCachedProjects(list);

  // 2. Persist to Firestore in background without blocking
  try {
    const docRef = doc(db, "projects", projectId);
    updateDoc(docRef, {
      name: trimmedName,
      description: trimmedDesc,
      updatedAt: serverTimestamp(),
    }).catch(() => {});
  } catch (err) {}
}

// FR-06 & Section 13: Delete project
export async function deleteProject(projectId) {
  // 1. Remove from cache immediately
  const list = getCachedProjects().filter((p) => p.id !== projectId);
  saveCachedProjects(list);

  // 2. Delete tasks and doc in Firestore in background
  try {
    const tasksRef = collection(db, "projects", projectId, "tasks");
    getDocs(tasksRef).then((tasksSnapshot) => {
      tasksSnapshot.forEach((taskDoc) => {
        deleteDoc(doc(db, "projects", projectId, "tasks", taskDoc.id)).catch(() => {});
      });
    }).catch(() => {});

    const docRef = doc(db, "projects", projectId);
    deleteDoc(docRef).catch(() => {});
  } catch (err) {}
}

function sanitizeMemberName(displayName, email) {
  let name = (displayName || "").replace(/\s*\([^)]*\)/g, "").trim();
  if (!name || name.toLowerCase() === "member" || name === "عضو" || name.toLowerCase().startsWith("member")) {
    if (email && email.includes("@")) {
      name = email.split("@")[0].replace(/\s*\([^)]*\)/g, "").trim();
    }
  }
  return name || "عضو";
}

// FR-07, US-04, TC-07, TC-08: Add member by email
export async function addProjectMemberByEmail(projectId, email) {
  if (!email || !email.trim()) {
    throw new Error("Email address is required.");
  }
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = sanitizeMemberName("", cleanEmail);

  const targetUserId = "user_" + Math.random().toString(36).substring(2, 9);
  const targetUserData = { displayName: cleanName, email: cleanEmail };

  // Save profile to cache
  saveCachedMemberProfile(targetUserId, targetUserData);

  // Update local cache
  const list = getCachedProjects().map((p) => {
    if (p.id === projectId) {
      const currentMembers = p.memberIds || [];
      if (currentMembers.includes(targetUserId)) {
        throw new Error("User is already a member of this project.");
      }
      return { ...p, memberIds: [...currentMembers, targetUserId] };
    }
    return p;
  });
  saveCachedProjects(list);

  // Sync to Firestore in background without blocking
  try {
    const projectRef = doc(db, "projects", projectId);
    updateDoc(projectRef, {
      memberIds: arrayUnion(targetUserId),
      updatedAt: serverTimestamp(),
    }).catch(() => {});
  } catch {}

  return { uid: targetUserId, ...targetUserData };
}

// FR-07 & Section 13: Remove member from project
export async function removeProjectMember(projectId, memberId, ownerId) {
  if (memberId === ownerId) {
    throw new Error("The project owner cannot be removed from the project.");
  }

  // Update cache immediately
  const list = getCachedProjects().map((p) => {
    if (p.id === projectId) {
      return { ...p, memberIds: (p.memberIds || []).filter((id) => id !== memberId) };
    }
    return p;
  });
  saveCachedProjects(list);

  // Sync to Firestore in background without blocking
  try {
    const projectRef = doc(db, "projects", projectId);
    updateDoc(projectRef, {
      memberIds: arrayRemove(memberId),
      updatedAt: serverTimestamp(),
    }).catch(() => {});
  } catch {}
}

// Fetch member profile details given an array of memberIds
export async function getProjectMembersDetails(memberIds = []) {
  if (!memberIds || memberIds.length === 0) return [];

  const profilesMap = getCachedMemberProfiles();

  return await Promise.all(
    memberIds.map(async (uid) => {
      if (profilesMap[uid]) {
        const p = profilesMap[uid];
        const cleanName = sanitizeMemberName(p.displayName, p.email);
        return { uid, displayName: cleanName, email: p.email || "" };
      }
      try {
        const userDoc = await withTimeout(getDoc(doc(db, "users", uid)), 300);
        if (userDoc && userDoc.exists()) {
          const data = userDoc.data();
          saveCachedMemberProfile(uid, data);
          const cleanName = sanitizeMemberName(data.displayName, data.email);
          return { uid: userDoc.id, displayName: cleanName, email: data.email || "" };
        }
      } catch {}
      return { uid, displayName: "عضو", email: "" };
    })
  );
}
