import type { Project, Task } from "./types";

const projectService = {
  getProject: async (): Promise<Project> => {
    const res = await fetch("/api/project");
    if (!res.ok) throw new Error("Could not fetch project");
    return res.json();
  },

  deleteTask: async (id: number): Promise<void> => {
    const res = await fetch(`/api/project/task/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Could not delete task");
  },

  updateTask: async (task: Task): Promise<Task> => {
    const res = await put("/api/project/task", task);
    if (!res.ok) throw new Error("Could not update task");
    return res.json();
  },

  addTask: async (task: { text: string; statusId: string }): Promise<Task> => {
    const res = await post("/api/project/task", task);
    if (!res.ok) throw new Error("Could not add task");
    return res.json();
  },

  moveTask: async (task_id: number, status_id: string) => {
    const res = await fetch(`/api/project/task/${task_id}/move/${status_id}`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("Could not update task status");
  },
};

function put<T>(url: string, body: T) {
  return fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function post<T>(url: string, body: T) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export default projectService;
