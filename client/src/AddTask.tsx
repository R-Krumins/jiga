import { useState } from "react";
import { useProject } from "./ProjectContext";

export default function AddTask() {
  const [taskName, setTaskName] = useState("");
  const { addTask } = useProject();

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (taskName.length === 0) return;
    addTask(taskName, "todo").then(() => setTaskName(""));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="font-bold text-lg">Add Task</h2>
      <input
        type="text"
        name="add-task"
        id="add-task-field"
        className="border mr-2 px-2 py-1"
        placeholder="new task"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
      />
      <button className="border px-3 py-1 bg-gray-200">+</button>
    </form>
  );
}
