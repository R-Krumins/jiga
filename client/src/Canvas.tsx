import { DragDropProvider } from "@dnd-kit/react";
import { useState } from "react";
import type { Status, Task } from "./types";
import StatusColumn from "./StatusColumn";
import { saveProject } from "./service";

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

          const taskId = event.operation.source?.id as number;
          const newStatus = event.operation.target?.id as string;

          const updatedTasks = tasks.map((task) =>
            task.id === taskId ? { ...task, statusId: newStatus } : task,
          );

          saveProject({ statuses: props.columns, tasks: updatedTasks });
          setTasks(updatedTasks);
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
