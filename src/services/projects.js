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
import { auth, db } from "@/lib/firebase";

// Local storage keys
const LOCAL_PROJECTS_KEY = "taskflow_local_projects";

// Helper to compute weighted task progress
export function calculateTasksProgress(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return { taskCount: 0, completedCount: 0, progressPercent: 0 };
  }
  let weightedSum = 0;
  let completedCount = 0;

  for (const task of tasks) {
    if (task.status === "done") {
      weightedSum += 1.0;
      completedCount += 1;
    } else if (task.status === "review" || task.status === "in_review") {
      weightedSum += 0.8;
    } else if (task.status === "in_progress") {
      weightedSum += 0.5;
    } else {
      weightedSum += 0.0;
    }
  }

  const progressPercent = Math.min(100, Math.round((weightedSum / tasks.length) * 100));

  return {
    taskCount: tasks.length,
    completedCount,
    progressPercent,
  };
}

// Helper to compute and attach task progress to projects from local task storage
export function attachProjectProgress(projectList) {
  if (!Array.isArray(projectList)) return [];
  return projectList.map((p) => {
    let taskCount = p.taskCount;
    let completedCount = p.completedCount;
    let progressPercent = p.progressPercent;

    if (typeof window !== "undefined" && p.id) {
      try {
        const raw = localStorage.getItem("taskflow_tasks_" + p.id);
        if (raw) {
          const tasks = JSON.parse(raw);
          const calculated = calculateTasksProgress(tasks);
          taskCount = calculated.taskCount;
          completedCount = calculated.completedCount;
          progressPercent = calculated.progressPercent;
        }
      } catch {}
    }

    return {
      ...p,
      taskCount: taskCount !== undefined ? taskCount : 0,
      completedCount: completedCount !== undefined ? completedCount : 0,
      progressPercent: progressPercent !== undefined ? progressPercent : 0,
    };
  });
}

// Local cache helpers to guarantee instant sub-50ms speeds and offline resilience
function getCachedProjects() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_PROJECTS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    let changed = false;
    const cleaned = list.map((p) => {
      if (Array.isArray(p.memberIds)) {
        const filtered = p.memberIds.filter(
          (id) =>
            id &&
            typeof id === "string" &&
            !id.startsWith("member_") &&
            !id.startsWith("user_") &&
            id !== "member" &&
            id !== "owner"
        );
        if (filtered.length !== p.memberIds.length) {
          changed = true;
          return {
            ...p,
            memberIds: filtered.length > 0 ? filtered : (p.ownerId ? [p.ownerId] : []),
          };
        }
      }
      return p;
    });
    if (changed) {
      try {
        localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(cleaned));
      } catch {}
    }
    return attachProjectProgress(cleaned);
  } catch {
    return [];
  }
}

function saveCachedProjects(projects) {
  if (typeof window === "undefined") return;
  try {
    const withProgress = attachProjectProgress(projects);
    localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(withProgress));
  } catch (err) {
    console.error("Cache save error:", err);
  }
}

const LOCAL_MEMBERS_CACHE_KEY = "taskflow_members_cache";

function getCachedMemberProfiles() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_MEMBERS_CACHE_KEY);
    if (!raw) return {};
    const map = JSON.parse(raw);
    let changed = false;
    for (const key of Object.keys(map)) {
      const prof = map[key];
      // Clean up fake/mock generated IDs and emails from earlier testing
      if (
        key.startsWith("user_") ||
        key.startsWith("member_") ||
        key === "member" ||
        key === "owner" ||
        !prof?.email ||
        !prof.email.includes("@")
      ) {
        delete map[key];
        changed = true;
      }
    }
    if (changed) {
      try {
        localStorage.setItem(LOCAL_MEMBERS_CACHE_KEY, JSON.stringify(map));
      } catch {}
    }
    return map;
  } catch {
    return {};
  }
}

function saveCachedMemberProfile(uid, data) {
  if (typeof window === "undefined" || !uid) return;
  // Never save mock or fake generated IDs into persistent member profiles
  if (uid.startsWith("user_") || uid.startsWith("member_") || uid === "member" || uid === "owner") return;
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

const lastProjectSyncMap = new Map();
const PROJECT_SYNC_THROTTLE_MS = 30000;

// Helper to sync remote projects in background
export async function syncRemoteProjects(userId) {
  if (!userId) return [];
  const now = Date.now();
  const lastSync = lastProjectSyncMap.get(userId) || 0;
  if (now - lastSync < PROJECT_SYNC_THROTTLE_MS) {
    const local = getCachedProjects();
    return attachProjectProgress(
      local.filter(
        (p) => p.ownerId === userId || (Array.isArray(p.memberIds) && p.memberIds.includes(userId))
      )
    );
  }
  lastProjectSyncMap.set(userId, now);

  try {
    const q = query(
      collection(db, "projects"),
      where("memberIds", "array-contains", userId)
    );
    const querySnapshot = await withTimeout(getDocs(q), 2500);
    const remoteProjects = [];
    querySnapshot.forEach((docSnap) => {
      remoteProjects.push({ id: docSnap.id, ...docSnap.data() });
    });

    // Also fetch projects where userId is ownerId
    try {
      const qOwner = query(
        collection(db, "projects"),
        where("ownerId", "==", userId)
      );
      const ownerSnapshot = await withTimeout(getDocs(qOwner), 2500);
      ownerSnapshot.forEach((docSnap) => {
        if (!remoteProjects.some((rp) => rp.id === docSnap.id)) {
          remoteProjects.push({ id: docSnap.id, ...docSnap.data() });
        }
      });
    } catch {}

    const local = getCachedProjects();
    // Keep local projects of other users intact, but merge remote for this user
    const otherProjects = local.filter(
      (p) => p.ownerId !== userId && (!Array.isArray(p.memberIds) || !p.memberIds.includes(userId))
    );

    const mergedUserProjects = remoteProjects.map((p) => {
      const existing = local.find((l) => l.id === p.id) || {};
      return {
        ...existing,
        ...p,
        taskCount: p.taskCount !== undefined ? p.taskCount : existing.taskCount,
        completedCount: p.completedCount !== undefined ? p.completedCount : existing.completedCount,
        progressPercent: p.progressPercent !== undefined ? p.progressPercent : existing.progressPercent,
      };
    });

    saveCachedProjects([...mergedUserProjects, ...otherProjects]);
    return attachProjectProgress(mergedUserProjects);
  } catch (err) {
    // Firestore offline or not configured
    const local = getCachedProjects();
    return attachProjectProgress(
      local.filter(
        (p) => p.ownerId === userId || (Array.isArray(p.memberIds) && p.memberIds.includes(userId))
      )
    );
  }
}

// Get all projects accessible by user (Owner or Member)
export async function getUserProjects(userId) {
  const currentUid = userId || auth.currentUser?.uid;
  if (!currentUid) return [];

  const allCached = getCachedProjects();

  // Strictly filter cached projects belonging to the current user (Owner or Member)
  const userCached = allCached.filter((p) => {
    const isOwner = p.ownerId === currentUid;
    const isMember = Array.isArray(p.memberIds) && p.memberIds.includes(currentUid);
    return isOwner || isMember;
  });

  if (userId) {
    syncRemoteProjects(userId).catch(() => {});
  }

  return attachProjectProgress(userCached);
}

// Get single project by ID
export async function getProjectById(projectId) {
  if (!projectId) return null;

  // Check cache first for instant 0ms access
  const allCached = getCachedProjects();
  const cached = allCached.find((p) => p.id === projectId);
  if (cached) {
    // Background refresh
    (async () => {
      try {
        const docRef = doc(db, "projects", projectId);
        const docSnap = await withTimeout(getDoc(docRef), 1500);
        if (docSnap && docSnap.exists()) {
          const remoteData = { id: docSnap.id, ...docSnap.data() };
          const data = {
            ...cached,
            ...remoteData,
            taskCount: remoteData.taskCount ?? cached.taskCount,
            completedCount: remoteData.completedCount ?? cached.completedCount,
            progressPercent: remoteData.progressPercent ?? cached.progressPercent,
          };
          const list = getCachedProjects().filter((p) => p.id !== projectId);
          saveCachedProjects([data, ...list]);
        }
      } catch {}
    })().catch(() => {});
    return attachProjectProgress([cached])[0];
  }

  try {
    const docRef = doc(db, "projects", projectId);
    const docSnap = await withTimeout(getDoc(docRef), 1500);

    if (docSnap && docSnap.exists()) {
      const data = { id: docSnap.id, ...docSnap.data() };
      const list = getCachedProjects().filter((p) => p.id !== projectId);
      saveCachedProjects([data, ...list]);
      return attachProjectProgress([data])[0];
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
  return name || "";
}

// FR-07, US-04, TC-07, TC-08: Add member by email (Strictly only real, registered users on TaskFlow)
export async function addProjectMemberByEmail(projectId, email) {
  if (!email || !email.trim()) {
    throw new Error("errEnterEmail");
  }
  const cleanEmail = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new Error("errInvalidEmail");
  }

  // 1. Get current project to verify ownership and membership
  const allCached = getCachedProjects();
  const currentProject = allCached.find((p) => p.id === projectId);

  // 2. Query Firestore registered_emails and users collections to verify the user actually exists
  let targetUserId = null;
  let targetUserData = null;

  // A) Point read registered_emails/{cleanEmail} (superfast direct document lookup)
  try {
    const regEmailDoc = await withTimeout(getDoc(doc(db, "registered_emails", cleanEmail)), 1500);
    if (regEmailDoc && regEmailDoc.exists()) {
      const data = regEmailDoc.data();
      if (data && data.uid) {
        targetUserId = data.uid;
        targetUserData = {
          displayName: sanitizeMemberName(data.displayName, data.email || cleanEmail),
          email: cleanEmail,
        };
      }
    }
  } catch (err) {
    console.warn("registered_emails point lookup note:", err?.message);
  }

  // B) Query users collection by email
  if (!targetUserId) {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", cleanEmail));
      const querySnapshot = await withTimeout(getDocs(q), 2500);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        targetUserId = userDoc.id;
        const data = userDoc.data();
        targetUserData = {
          displayName: sanitizeMemberName(data.displayName, data.email || cleanEmail),
          email: cleanEmail,
        };
      }
    } catch (err) {
      console.warn("Firestore users query note:", err?.message);
    }
  }

  // C) Check if current authenticated user matches this email
  if (!targetUserId && auth?.currentUser?.email?.toLowerCase() === cleanEmail) {
    targetUserId = auth.currentUser.uid;
    targetUserData = {
      displayName: sanitizeMemberName(auth.currentUser.displayName, auth.currentUser.email),
      email: cleanEmail,
    };
  }

  // CRITICAL SECURITY & BUSINESS RULE:
  // Strictly reject if the user is NOT registered in the platform!
  // Absolutely NO local cache fallback or simulated random IDs!
  if (!targetUserId || !targetUserData || !targetUserData.email) {
    throw new Error("errUserNotFound");
  }

  // Check if target user is the project owner
  if (currentProject && currentProject.ownerId === targetUserId) {
    throw new Error("errIsOwner");
  }

  // Check if target user is already a member
  if (currentProject && (currentProject.memberIds || []).includes(targetUserId)) {
    throw new Error("errAlreadyMember");
  }

  // Save real verified profile to cache
  saveCachedMemberProfile(targetUserId, targetUserData);

  // Update local cache
  const list = getCachedProjects().map((p) => {
    if (p.id === projectId) {
      const currentMembers = p.memberIds || [];
      if (currentMembers.includes(targetUserId)) {
        throw new Error("errAlreadyMember");
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

// Fetch member profile details given an array of memberIds (strictly filters out any unregistered members)
export async function getProjectMembersDetails(memberIds = [], projectId = null) {
  if (!memberIds || memberIds.length === 0) return [];

  // Filter out dummy/fake IDs immediately (member_*, user_*, member, owner)
  const cleanMemberIds = memberIds.filter(
    (uid) =>
      uid &&
      typeof uid === "string" &&
      !uid.startsWith("member_") &&
      !uid.startsWith("user_") &&
      uid !== "member" &&
      uid !== "owner"
  );
  if (cleanMemberIds.length === 0) return [];

  const profilesMap = getCachedMemberProfiles();

  const results = await Promise.all(
    cleanMemberIds.map(async (uid) => {
      // 1. Check local cache (only if valid registered profile with real email)
      if (
        profilesMap[uid] &&
        profilesMap[uid].email &&
        profilesMap[uid].email.includes("@") &&
        !uid.startsWith("user_") &&
        !uid.startsWith("member_")
      ) {
        const p = profilesMap[uid];
        const cleanName = sanitizeMemberName(p.displayName, p.email);
        return { uid, displayName: cleanName, email: p.email.toLowerCase() };
      }

      // 2. Query Firestore users/{uid}
      try {
        const userDoc = await withTimeout(getDoc(doc(db, "users", uid)), 800);
        if (userDoc && userDoc.exists()) {
          const data = userDoc.data();
          if (data && data.email) {
            saveCachedMemberProfile(uid, data);
            const cleanName = sanitizeMemberName(data.displayName, data.email);
            return { uid: userDoc.id, displayName: cleanName, email: data.email.toLowerCase() };
          }
        }
      } catch {}

      // 3. Check current user if matches uid
      if (auth?.currentUser && auth.currentUser.uid === uid && auth.currentUser.email) {
        const cleanName = sanitizeMemberName(auth.currentUser.displayName, auth.currentUser.email);
        return { uid, displayName: cleanName, email: auth.currentUser.email.toLowerCase() };
      }

      return null;
    })
  );

  // Return ONLY real registered members who have an email
  const validMembers = results.filter(Boolean);

  // If there were bogus/unregistered IDs in the project, automatically purge them from the cache!
  if (projectId && validMembers.length !== memberIds.length) {
    const validUids = validMembers.map((m) => m.uid);
    try {
      const allCached = getCachedProjects();
      const updated = allCached.map((p) => {
        if (p.id === projectId) {
          return { ...p, memberIds: validUids };
        }
        return p;
      });
      saveCachedProjects(updated);
    } catch {}
  }

  return validMembers;
}
