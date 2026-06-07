import { DragDropProvider } from "@dnd-kit/react";
import { useState } from "react";
import type { Status, Task } from "./types";
import StatusColumn from "./StatusColumn";

type CanvasProps = {
  columns: Status[];
  tasks: Task[];
};

export default function Canvas(props: CanvasProps) {
  const [tasks, setTasks] = useState(props.tasks);
  return (
    <div className="flex gap-8 justify-center">
      <DragDropProvider
        onDragEnd={(event) => {
          if (event.canceled) return;

          const taskId = event.operation.source?.id as string;
          const newStatus = event.operation.target?.id as string;

          setTasks((tasks) =>
            tasks.map((task) =>
              task.id === taskId ? { ...task, statusId: newStatus } : task,
            ),
          );
        }}
      >
        {props.columns.map((column) => (
          <StatusColumn
            key={column.id}
            column={column}
            tasks={tasks.filter((task) => task.statusId === column.id)}
          />
        ))}
      </DragDropProvider>
    </div>
  );
}
