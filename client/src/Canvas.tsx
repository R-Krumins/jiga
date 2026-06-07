import { DragDropProvider } from "@dnd-kit/react";
import { useProject } from "./ProjectContext";
import StatusColumn from "./StatusColumn";
import Trash from "./Trash";
import { useState } from "react";

export default function Canvas() {
  const { project, moveTask, deleteTask } = useProject();
  const [expandTrash, setExpandTrash] = useState(false);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        if (!event.operation.target) return;

        const taskId = event.operation.source?.id as number;
        const target = event.operation.target?.id as string;

        if (target === "trash") {
          deleteTask(taskId);
          setExpandTrash(false);
          return;
        }

        moveTask(taskId, target);
      }}
      onDragOver={(event) => {
        if (event.operation.target?.id === "trash") {
          setExpandTrash(true);
        } else {
          setExpandTrash(false);
        }
      }}
    >
      <div className="flex gap-8 justify-center mb-8">
        {project.statuses.map((column) => (
          <StatusColumn
            key={column.id}
            column={column}
            tasks={project.tasks.filter((task) => task.statusId === column.id)}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <Trash expand={expandTrash} />
      </div>
    </DragDropProvider>
  );
}
