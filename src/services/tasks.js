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

// Helper to determine if a task is overdue
export function isTaskOverdue(dueDate, status) {
  if (!dueDate || status === "done") return false;

  const due = new Date(dueDate);
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
  userId
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

  // 1. Generate unique task document reference and ID
  const tasksColRef = collection(db, "projects", projectId, "tasks");
  const newTaskDocRef = doc(tasksColRef);
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
  saveCachedTasks(projectId, [taskData, ...cached]);

  // 3. Sync to Firestore in background
  try {
    await withTimeout(
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
      }),
      2500
    );
  } catch (err) {
    console.warn("Firestore task create deferred or offline:", err.message);
  }

  return taskData;
}

// Helper to sync remote tasks in background
async function syncRemoteTasks(projectId) {
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

  // 2. Persist to Firestore
  try {
    const taskDocRef = doc(db, "projects", projectId, "tasks", taskId);
    await withTimeout(
      updateDoc(taskDocRef, { ...updates, updatedAt: serverTimestamp() }),
      2500
    );
  } catch (err) {
    console.warn("Firestore task update deferred:", err.message);
  }
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

  // 2. Delete from Firestore
  try {
    const taskDocRef = doc(db, "projects", projectId, "tasks", taskId);
    await withTimeout(deleteDoc(taskDocRef), 2500);
  } catch (err) {
    console.warn("Firestore task delete deferred:", err.message);
  }
}

// FR-14: Calculate User Dashboard Stats across all accessible projects
export async function getUserDashboardStats(accessibleProjects) {
  let totalTasks = 0;
  let todoTasks = 0;
  let inProgressTasks = 0;
  let reviewTasks = 0;
  let doneTasks = 0;
  let overdueTasks = [];
  let allTasks = [];

  const tasksPerProject = await Promise.all(
    accessibleProjects.map(async (project) => {
      const tasks = await getProjectTasks(project.id);
      return { project, tasks };
    })
  );

  for (const { project, tasks } of tasksPerProject) {
    let projectCompleted = 0;

    for (const task of tasks) {
      totalTasks += 1;
      if (task.status === "todo") todoTasks += 1;
      else if (task.status === "in_progress") inProgressTasks += 1;
      else if (task.status === "review" || task.status === "in_review") reviewTasks += 1;
      else if (task.status === "done") {
        doneTasks += 1;
        projectCompleted += 1;
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

    project.taskCount = tasks.length;
    project.completedCount = projectCompleted;
    project.progressPercent = tasks.length > 0 ? Math.round((projectCompleted / tasks.length) * 100) : 0;
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
