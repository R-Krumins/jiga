import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Project, Task } from "./types";
import projectService from "./service";

type ProjectContextType = {
  project: Project;
  addTask: (text: string, statusId: string) => Promise<void>;
  moveTask: (taskId: number, newStatusId: string) => void;
  deleteTask: (taskId: number) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
};

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    projectService.getProject().then(setProject);
  }, []);

  if (!project) return <div>Loading...</div>;

  const addTask = async (text: string, statusId: string) => {
    const newTask = await projectService.addTask({ text, statusId });
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
      projectService.moveTask(taskId, newStatusId);
      return { ...prev, tasks: updatedTasks };
    });
  };

  const deleteTask = async (taskId: number) => {
    await projectService.deleteTask(taskId);
    setProject((prev) => {
      if (!prev) return prev;
      return { ...prev, tasks: prev.tasks.filter((t) => t.id !== taskId) };
    });
  };

  const updateTask = async (task: Task) => {
    const updated = await projectService.updateTask(task);
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === task.id ? updated : t)),
      };
    });
  };

  return (
    <ProjectContext.Provider
      value={{ project, addTask, moveTask, deleteTask, updateTask }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
}
