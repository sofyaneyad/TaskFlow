import {
  collection,
  doc,
  addDoc,
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

// FR-05 & FR-18: Create Project
export async function createProject({ name, description = "", ownerId }) {
  if (!name || name.trim().length < 3 || name.trim().length > 80) {
    throw new Error("Project name is required and must be between 3 and 80 characters.");
  }
  if (description && description.length > 1000) {
    throw new Error("Description must not exceed 1000 characters.");
  }

  const projectData = {
    name: name.trim(),
    description: description.trim(),
    ownerId,
    memberIds: [ownerId], // memberIds must always include ownerId (Section 10)
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "projects"), projectData);
  return { id: docRef.id, ...projectData };
}

// Get all projects accessible by user (Owner or Member)
export async function getUserProjects(userId) {
  if (!userId) return [];
  const q = query(
    collection(db, "projects"),
    where("memberIds", "array-contains", userId)
  );

  const querySnapshot = await getDocs(q);
  const projects = [];
  querySnapshot.forEach((docSnap) => {
    projects.push({ id: docSnap.id, ...docSnap.data() });
  });

  return projects;
}

// Get single project by ID
export async function getProjectById(projectId) {
  if (!projectId) return null;
  const docRef = doc(db, "projects", projectId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }
  return { id: docSnap.id, ...docSnap.data() };
}

// FR-06: Update project details (Owner only)
export async function updateProject(projectId, { name, description }) {
  if (!name || name.trim().length < 3 || name.trim().length > 80) {
    throw new Error("Project name is required and must be between 3 and 80 characters.");
  }
  if (description && description.length > 1000) {
    throw new Error("Description must not exceed 1000 characters.");
  }

  const docRef = doc(db, "projects", projectId);
  await updateDoc(docRef, {
    name: name.trim(),
    description: description ? description.trim() : "",
    updatedAt: serverTimestamp(),
  });
}

// FR-06 & Section 13: Delete project and clean up tasks
export async function deleteProject(projectId) {
  // First, delete subcollection tasks
  const tasksRef = collection(db, "projects", projectId, "tasks");
  const tasksSnapshot = await getDocs(tasksRef);
  const deletePromises = [];
  tasksSnapshot.forEach((taskDoc) => {
    deletePromises.push(deleteDoc(doc(db, "projects", projectId, "tasks", taskDoc.id)));
  });
  await Promise.all(deletePromises);

  // Then delete project doc
  const docRef = doc(db, "projects", projectId);
  await deleteDoc(docRef);
}

// FR-07, US-04, TC-07, TC-08: Add member by email
export async function addProjectMemberByEmail(projectId, email) {
  if (!email || !email.trim()) {
    throw new Error("Email address is required.");
  }
  const cleanEmail = email.trim().toLowerCase();

  // 1. Look up user in `users` collection
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", cleanEmail));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("No registered user found with this email. Only registered users can be added.");
  }

  const targetUserDoc = querySnapshot.docs[0];
  const targetUserId = targetUserDoc.id;
  const targetUserData = targetUserDoc.data();

  // 2. Fetch current project to check duplicate membership
  const projectRef = doc(db, "projects", projectId);
  const projectSnap = await getDoc(projectRef);
  if (!projectSnap.exists()) {
    throw new Error("Project not found.");
  }

  const projectData = projectSnap.data();
  if (projectData.memberIds && projectData.memberIds.includes(targetUserId)) {
    throw new Error("User is already a member of this project.");
  }

  // 3. Add to memberIds
  await updateDoc(projectRef, {
    memberIds: arrayUnion(targetUserId),
    updatedAt: serverTimestamp(),
  });

  return { uid: targetUserId, ...targetUserData };
}

// FR-07 & Section 13: Remove member from project
export async function removeProjectMember(projectId, memberId, ownerId) {
  if (memberId === ownerId) {
    throw new Error("The project owner cannot be removed from the project.");
  }

  const projectRef = doc(db, "projects", projectId);
  await updateDoc(projectRef, {
    memberIds: arrayRemove(memberId),
    updatedAt: serverTimestamp(),
  });
}

// Fetch member profile details given an array of memberIds
export async function getProjectMembersDetails(memberIds = []) {
  if (!memberIds || memberIds.length === 0) return [];

  const members = [];
  for (const uid of memberIds) {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        members.push({ uid: userDoc.id, ...userDoc.data() });
      } else {
        members.push({ uid, displayName: "Member (" + uid.slice(0, 5) + ")", email: "" });
      }
    } catch {
      members.push({ uid, displayName: "Member (" + uid.slice(0, 5) + ")", email: "" });
    }
  }
  return members;
}
