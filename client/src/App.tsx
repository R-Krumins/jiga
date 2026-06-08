import { ProjectProvider } from "./ProjectContext";
import Canvas from "./Canvas";
import AddTask from "./AddTask";

export default function App() {
  return (
    <ProjectProvider>
      <div className="px-8 pt-16">
        <div className="mb-12 flex justify-center">
          <AddTask />
        </div>
        <Canvas />
      </div>
    </ProjectProvider>
  );
}
