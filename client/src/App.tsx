import { useEffect, useState } from "react";
import Canvas from "./Canvas";
import type { Project } from "./types";
import { getProject } from "./service";

export default function App() {
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    getProject().then((res) => setProject(res));
  });

  if (!project) {
    return <div>Loading...</div>;
  }

  return <Canvas columns={project.statuses} tasks={project.tasks} />;
}
