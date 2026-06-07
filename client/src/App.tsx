import { useEffect, useState } from "react";
import Canvas from "./Canvas";
import type { Project, Task } from "./types";
import { getProject } from "./service";
import AddTask from "./AddTask";

export default function App() {
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    getProject().then((res) => setProject(res));
  });

  const handleNewTask = (task: Task) => {
    setProject((prev) => {
      if (!prev) return prev;
      return { ...prev, tasks: [...prev.tasks, task] };
    });
  };

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="px-8 pt-16">
      <Canvas columns={project.statuses} tasks={project.tasks} />
      <div className="my-8" />
      <AddTask onAddTask={handleNewTask} />
    </div>
  );
}
