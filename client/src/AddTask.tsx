import { useState } from "react";
import { addTask } from "./service";
import type { Task } from "./types";

type AddTaskProps = {
  onAddTask: (task: Task) => void;
};

export default function AddTask(props: AddTaskProps) {
  const [taskName, setTaskName] = useState("");

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (taskName.length === 0) return;
    addTask({ text: taskName, statusId: "todo" }).then((newTask) => {
      setTaskName("");
      props.onAddTask(newTask);
    });
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
