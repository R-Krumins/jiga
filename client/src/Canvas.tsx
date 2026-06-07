import { DragDropProvider } from "@dnd-kit/react";
import { useProject } from "./ProjectContext";
import StatusColumn from "./StatusColumn";

export default function Canvas() {
  const { project, moveTask } = useProject();

  return (
    <div className="flex gap-8 justify-center">
      <DragDropProvider
        onDragEnd={(event) => {
          if (event.canceled) return;
          if (!event.operation.target) return;

          const taskId = event.operation.source?.id as number;
          const newStatus = event.operation.target?.id as string;

          console.log({ taskId, newStatus });

          moveTask(taskId, newStatus);
        }}
      >
        {project.statuses.map((column) => (
          <StatusColumn
            key={column.id}
            column={column}
            tasks={project.tasks.filter((task) => task.statusId === column.id)}
          />
        ))}
      </DragDropProvider>
    </div>
  );
}
