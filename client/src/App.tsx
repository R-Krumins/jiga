import { ProjectProvider } from "./ProjectContext";
import Canvas from "./Canvas";
import AddTask from "./AddTask";

export default function App() {
  return (
    <ProjectProvider>
      <div className="px-8 pt-16">
        <Canvas />
        <div className="my-8" />
        <AddTask />
      </div>
    </ProjectProvider>
  );
}
