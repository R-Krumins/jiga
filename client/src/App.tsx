import KanbanBoard from "@components/KanbanBoard";
import AddTask from "@components/AddTask";
import Header from "@components/Header";

export default function App() {
  return (
    <>
      <Header />
      <div className="px-8 pt-8">
        <div className="mb-12 flex justify-center">
          <AddTask />
        </div>
        <KanbanBoard />
      </div>
    </>
  );
}
