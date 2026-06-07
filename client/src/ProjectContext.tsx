import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Project } from "./types";
import {
  addTask as addTaskService,
  deleteTask as deleteTaskService,
  getProject,
  saveProject,
} from "./service";

type ProjectContextType = {
  project: Project;
  addTask: (text: string, statusId: string) => Promise<void>;
  moveTask: (taskId: number, newStatusId: string) => void;
  deleteTask: (taskId: number) => Promise<void>;
};

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    getProject().then(setProject);
  }, []);

  if (!project) return <div>Loading...</div>;

  const addTask = async (text: string, statusId: string) => {
    const newTask = await addTaskService({ text, statusId });
    setProject((prev) => {
      if (!prev) return prev;
      return { ...prev, tasks: [...prev.tasks, newTask] };
    });
  };

  const moveTask = (taskId: number, newStatusId: string) => {
    setProject((prev) => {
      if (!prev) return prev;
      const updatedTasks = prev.tasks.map((t) =>
        t.id === taskId ? { ...t, statusId: newStatusId } : t,
      );
      saveProject({ statuses: prev.statuses, tasks: updatedTasks });
      return { ...prev, tasks: updatedTasks };
    });
  };

  const deleteTask = async (taskId: number) => {
    await deleteTaskService(taskId);
    setProject((prev) => {
      if (!prev) return prev;
      return { ...prev, tasks: prev.tasks.filter((t) => t.id !== taskId) };
    });
  };

  return (
    <ProjectContext.Provider value={{ project, addTask, moveTask, deleteTask }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
}
