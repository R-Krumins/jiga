import type { Project, Task } from "./types";

export async function getProject(): Promise<Project> {
  const res = await fetch("/api/project");
  if (!res.ok) throw new Error("Could not fetch project");
  return res.json();
}

export async function saveProject(project: Project) {
  const res = await post("/api/project", project);
  if (!res.ok) throw new Error("Could not save project");
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`/api/project/task/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Could not delete task");
}

export async function updateTask(
  id: number,
  fields: { text: string },
): Promise<Task> {
  const res = await fetch(`/api/project/task/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error("Could not update task");
  return res.json();
}

export async function addTask(task: {
  text: string;
  statusId: string;
}): Promise<Task> {
  const res = await post("/api/project/task", task);
  if (!res.ok) throw new Error("Could not add task");
  return res.json();
}

function post<T>(url: string, body: T) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
