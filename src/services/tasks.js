import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const VALID_STATUSES = ["todo", "in_progress", "done"];
const VALID_PRIORITIES = ["low", "medium", "high"];

// Helper to determine if a task is overdue
export function isTaskOverdue(dueDate, status) {
  if (!dueDate || status === "done") return false;

  const due = new Date(dueDate);
  if (isNaN(due.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If due date is strictly before today (00:00)
  const taskDueDay = new Date(due);
  taskDueDay.setHours(0, 0, 0, 0);

  return taskDueDay < today;
}

// FR-08, FR-11, FR-12, FR-18: Create Task
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

  const taskData = {
    title: title.trim(),
    description: description ? description.trim() : "",
    status,
    priority,
    dueDate: dueDate || null,
    assigneeId: assigneeId || null,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const tasksCollectionRef = collection(db, "projects", projectId, "tasks");
  const docRef = await addDoc(tasksCollectionRef, taskData);

  return { id: docRef.id, ...taskData };
}

// Get all tasks for a specific project
export async function getProjectTasks(projectId) {
  if (!projectId) return [];
  const tasksCollectionRef = collection(db, "projects", projectId, "tasks");
  const querySnapshot = await getDocs(tasksCollectionRef);

  const tasks = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    tasks.push({
      id: docSnap.id,
      ...data,
      isOverdue: isTaskOverdue(data.dueDate, data.status),
    });
  });

  return tasks;
}

// FR-09 & FR-11: Update task fields
export async function updateTask(projectId, taskId, updates) {
  if (!projectId || !taskId) {
    throw new Error("Project ID and Task ID are required.");
  }

  const cleanedUpdates = { ...updates, updatedAt: serverTimestamp() };

  if (cleanedUpdates.title !== undefined) {
    if (cleanedUpdates.title.trim().length < 3 || cleanedUpdates.title.trim().length > 120) {
      throw new Error("Task title must be between 3 and 120 characters.");
    }
    cleanedUpdates.title = cleanedUpdates.title.trim();
  }

  if (cleanedUpdates.description !== undefined && cleanedUpdates.description !== null) {
    if (cleanedUpdates.description.length > 1000) {
      throw new Error("Description must not exceed 1000 characters.");
    }
    cleanedUpdates.description = cleanedUpdates.description.trim();
  }

  if (cleanedUpdates.status !== undefined) {
    if (!VALID_STATUSES.includes(cleanedUpdates.status)) {
      throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
    }
  }

  if (cleanedUpdates.priority !== undefined) {
    if (!VALID_PRIORITIES.includes(cleanedUpdates.priority)) {
      throw new Error(`Invalid priority. Must be one of: ${VALID_PRIORITIES.join(", ")}`);
    }
  }

  const taskDocRef = doc(db, "projects", projectId, "tasks", taskId);
  await updateDoc(taskDocRef, cleanedUpdates);
}

// FR-10: Delete Task
export async function deleteTask(projectId, taskId) {
  if (!projectId || !taskId) {
    throw new Error("Project ID and Task ID are required.");
  }
  const taskDocRef = doc(db, "projects", projectId, "tasks", taskId);
  await deleteDoc(taskDocRef);
}

// FR-14: Calculate User Dashboard Stats across all accessible projects
export async function getUserDashboardStats(accessibleProjects) {
  let totalTasks = 0;
  let todoTasks = 0;
  let inProgressTasks = 0;
  let doneTasks = 0;
  let overdueTasks = [];

  for (const project of accessibleProjects) {
    const tasks = await getProjectTasks(project.id);
    for (const task of tasks) {
      totalTasks += 1;
      if (task.status === "todo") todoTasks += 1;
      else if (task.status === "in_progress") inProgressTasks += 1;
      else if (task.status === "done") doneTasks += 1;

      if (task.isOverdue) {
        overdueTasks.push({
          ...task,
          projectName: project.name,
          projectId: project.id,
        });
      }
    }
  }

  return {
    totalProjects: accessibleProjects.length,
    totalTasks,
    todoTasks,
    inProgressTasks,
    doneTasks,
    overdueTasks,
  };
}
