import KanbanBoard from "@components/KanbanBoard";
import AddTask from "@components/AddTask";

export default function App() {
  return (
    <div className="px-8 pt-16">
      <div className="mb-12 flex justify-center">
        <AddTask />
      </div>
      <KanbanBoard />
    </div>
  );
}
