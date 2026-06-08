import { useState } from "react";
import { useProject } from "./ProjectContext";
import { Plus } from "lucide-react";

export default function AddTask() {
  const [taskName, setTaskName] = useState("");
  const { addTask } = useProject();

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (taskName.length === 0) return;
    addTask(taskName, "todo").then(() => setTaskName(""));
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center">
      <input
        type="text"
        name="add-task"
        id="add-task-field"
        placeholder="New task..."
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        className="bg-raised rounded-xl mr-2 px-4 py-2.5 w-80"
      />
      <button className="px-3 py-2 bg-accent rounded-xl">
        <Plus />
      </button>
    </form>
  );
}
