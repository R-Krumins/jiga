import KanbanBoard from "@components/KanbanBoard";
import Header from "@components/Header";

export default function App() {
  return (
    <>
      <Header />
      <div className="px-8 pt-8">
        <KanbanBoard />
      </div>
    </>
  );
}
