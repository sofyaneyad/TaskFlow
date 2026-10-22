import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { calculateTasksProgress } from "./projects";

const VALID_STATUSES = ["todo", "in_progress", "review", "done"];
const VALID_PRIORITIES = ["low", "medium", "high"];

// Local storage key prefix
const LOCAL_TASKS_PREFIX = "taskflow_tasks_";

function getCachedTasks(projectId) {
  if (typeof window === "undefined" || !projectId) return [];
  try {
    const raw = localStorage.getItem(LOCAL_TASKS_PREFIX + projectId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCachedTasks(projectId, tasks) {
  if (typeof window === "undefined" || !projectId) return;
  try {
    localStorage.setItem(LOCAL_TASKS_PREFIX + projectId, JSON.stringify(tasks));
  } catch {}
}

export function updateProjectCacheProgress(projectId) {
  if (typeof window === "undefined" || !projectId) return;
  try {
    const raw = localStorage.getItem("taskflow_local_projects");
    if (!raw) return;
    const projects = JSON.parse(raw);
    const tasks = getCachedTasks(projectId);
    const { taskCount, completedCount, progressPercent } = calculateTasksProgress(tasks);

    let modified = false;
    const updated = projects.map((p) => {
      if (p.id === projectId) {
        modified = true;
        return {
          ...p,
          taskCount,
          completedCount,
          progressPercent,
        };
      }
      return p;
    });

    if (modified) {
      localStorage.setItem("taskflow_local_projects", JSON.stringify(updated));
    }
  } catch (err) {
    console.error("Error updating project cache progress:", err);
  }
}

let firestoreTasksReachable = true;

const withTimeout = (promise, ms = 500) => {
  if (!firestoreTasksReachable) {
    return Promise.reject(new Error("Firestore offline or unavailable"));
  }
  return Promise.race([
    promise.catch((err) => {
      if (
        err?.message?.includes("not found") ||
        err?.message?.includes("Failed to get document") ||
        err?.code === "not-found"
      ) {
        firestoreTasksReachable = false;
      }
      throw err;
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);
};

// Helper to determine if a task is overdue (supports ISO string, Date, and Firestore Timestamp)
export function isTaskOverdue(dueDate, status) {
  if (!dueDate || status === "done") return false;

  const due = dueDate?.seconds ? new Date(dueDate.seconds * 1000) : new Date(dueDate);
  if (isNaN(due.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const taskDueDay = new Date(due);
  taskDueDay.setHours(0, 0, 0, 0);

  return taskDueDay < today;
}

// FR-08, FR-11, FR-12, FR-18: Create Task (Instant sub-50ms cache + background Firestore sync)
export async function createTask(
  projectId,
  {
    title,
    description = "",
    status = "todo",
    priority = "medium",
    dueDate = null,
    assigneeId = null,
  },
  userId,
  customTaskId = null
) {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }
  if (!title || title.trim().length < 3 || title.trim().length > 120) {
    throw new Error("Task title is required and must be between 3 and 120 characters.");
  }
  if (description && description.length > 1000) {
    throw new Error("Task description cannot exceed 1000 characters.");
  }
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
  }
  if (!VALID_PRIORITIES.includes(priority)) {
    throw new Error(`Invalid priority. Must be one of: ${VALID_PRIORITIES.join(", ")}`);
  }

  // 1. Generate or use consistent document reference and ID
  const tasksColRef = collection(db, "projects", projectId, "tasks");
  const newTaskDocRef = customTaskId ? doc(tasksColRef, customTaskId) : doc(tasksColRef);
  const taskId = newTaskDocRef.id;

  const nowIso = new Date().toISOString();
  const taskData = {
    id: taskId,
    title: title.trim(),
    description: description ? description.trim() : "",
    status,
    priority,
    dueDate: dueDate || null,
    assigneeId: assigneeId || null,
    createdBy: userId,
    createdAt: nowIso,
    updatedAt: nowIso,
    isOverdue: isTaskOverdue(dueDate, status),
  };

  // 2. Save to local cache immediately (instant feedback!)
  const cached = getCachedTasks(projectId);
  // Prevent duplicate if already added by optimistic UI
  const filtered = cached.filter((t) => t.id !== taskId);
  saveCachedTasks(projectId, [taskData, ...filtered]);
  updateProjectCacheProgress(projectId);

  // 3. Sync to Firestore in background without blocking
  setDoc(newTaskDocRef, {
    title: taskData.title,
    description: taskData.description,
    status: taskData.status,
    priority: taskData.priority,
    dueDate: taskData.dueDate,
    assigneeId: taskData.assigneeId,
    createdBy: taskData.createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }).catch((err) => {
    console.warn("Firestore task create deferred or offline:", err?.message);
  });

  return taskData;
}

const lastTaskSyncMap = new Map();
const TASK_SYNC_THROTTLE_MS = 30000;

// Helper to sync remote tasks in background
async function syncRemoteTasks(projectId) {
  if (!projectId) return [];
  const now = Date.now();
  const lastSync = lastTaskSyncMap.get(projectId) || 0;
  if (now - lastSync < TASK_SYNC_THROTTLE_MS) {
    return getCachedTasks(projectId);
  }
  lastTaskSyncMap.set(projectId, now);

  try {
    const tasksCollectionRef = collection(db, "projects", projectId, "tasks");
    const querySnapshot = await withTimeout(getDocs(tasksCollectionRef), 1500);

    const remoteTasks = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      remoteTasks.push({
        id: docSnap.id,
        ...data,
        isOverdue: isTaskOverdue(data.dueDate, data.status),
      });
    });

    if (remoteTasks.length > 0) {
      const cachedTasks = getCachedTasks(projectId);
      const mergedMap = new Map();
      cachedTasks.forEach((t) => mergedMap.set(t.id, t));
      remoteTasks.forEach((t) => mergedMap.set(t.id, t));
      const merged = Array.from(mergedMap.values());
      saveCachedTasks(projectId, merged);
      updateProjectCacheProgress(projectId);
      return merged;
    }
  } catch {}
  return [];
}

// Get all tasks for a specific project
export async function getProjectTasks(projectId) {
  if (!projectId) return [];

  // Read local cache first for instant 0ms speed
  const cachedTasks = getCachedTasks(projectId).map((t) => ({
    ...t,
    isOverdue: isTaskOverdue(t.dueDate, t.status),
  }));

  // If cache exists, return immediately and sync in background!
  if (cachedTasks.length > 0) {
    syncRemoteTasks(projectId).catch(() => {});
    return cachedTasks;
  }

  // If no cache, perform remote fetch
  const remote = await syncRemoteTasks(projectId);
  return remote.length > 0 ? remote : cachedTasks;
}

// FR-09 & FR-11: Update task fields
export async function updateTask(projectId, taskId, updates) {
  if (!projectId || !taskId) {
    throw new Error("Project ID and Task ID are required.");
  }

  const cleanedUpdates = { ...updates, updatedAt: new Date().toISOString() };

  // 1. Update cache immediately
  const cached = getCachedTasks(projectId);
  const updatedList = cached.map((t) => {
    if (t.id === taskId) {
      const updated = { ...t, ...cleanedUpdates };
      updated.isOverdue = isTaskOverdue(updated.dueDate, updated.status);
      return updated;
    }
    return t;
  });
  saveCachedTasks(projectId, updatedList);
  updateProjectCacheProgress(projectId);

  // 2. Persist to Firestore in background without blocking
  try {
    const taskDocRef = doc(db, "projects", projectId, "tasks", taskId);
    updateDoc(taskDocRef, { ...updates, updatedAt: serverTimestamp() }).catch((err) => {
      console.warn("Firestore task update deferred:", err?.message);
    });
  } catch (err) {}
}

// FR-10: Delete Task
export async function deleteTask(projectId, taskId) {
  if (!projectId || !taskId) {
    throw new Error("Project ID and Task ID are required.");
  }

  // 1. Delete from cache immediately
  const cached = getCachedTasks(projectId);
  const filtered = cached.filter((t) => t.id !== taskId);
  saveCachedTasks(projectId, filtered);
  updateProjectCacheProgress(projectId);

  // 2. Delete from Firestore in background without blocking
  try {
    const taskDocRef = doc(db, "projects", projectId, "tasks", taskId);
    deleteDoc(taskDocRef).catch((err) => {
      console.warn("Firestore task delete deferred:", err?.message);
    });
  } catch (err) {}
}

// FR-14: Calculate User Dashboard Stats across all accessible projects (sub-millisecond computation from cache)
export async function getUserDashboardStats(accessibleProjects) {
  if (!Array.isArray(accessibleProjects) || accessibleProjects.length === 0) {
    return {
      totalProjects: 0,
      totalTasks: 0,
      todoTasks: 0,
      inProgressTasks: 0,
      reviewTasks: 0,
      doneTasks: 0,
      overdueTasks: [],
      allTasks: [],
    };
  }

  let totalTasks = 0;
  let todoTasks = 0;
  let inProgressTasks = 0;
  let reviewTasks = 0;
  let doneTasks = 0;
  const overdueTasks = [];
  const allTasks = [];

  for (const project of accessibleProjects) {
    if (!project || !project.id) continue;
    const tasks = getCachedTasks(project.id).map((t) => ({
      ...t,
      isOverdue: isTaskOverdue(t.dueDate, t.status),
    }));

    for (const task of tasks) {
      totalTasks += 1;
      if (task.status === "todo") todoTasks += 1;
      else if (task.status === "in_progress") inProgressTasks += 1;
      else if (task.status === "review" || task.status === "in_review") reviewTasks += 1;
      else if (task.status === "done") {
        doneTasks += 1;
      }

      const taskWithProject = {
        ...task,
        projectName: project.name,
        projectId: project.id,
      };

      allTasks.push(taskWithProject);

      if (task.isOverdue) {
        overdueTasks.push(taskWithProject);
      }
    }

    const progressInfo = calculateTasksProgress(tasks);
    project.taskCount = progressInfo.taskCount;
    project.completedCount = progressInfo.completedCount;
    project.progressPercent = progressInfo.progressPercent;
  }

  return {
    totalProjects: accessibleProjects.length,
    totalTasks,
    todoTasks,
    inProgressTasks,
    reviewTasks,
    doneTasks,
    overdueTasks,
    allTasks,
  };
}
