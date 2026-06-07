import { useDroppable } from "@dnd-kit/react";
import type { Status, Task } from "./types";
import TaskCard from "./TaskCard";

type StatusColumnProps = {
  column: Status;
  tasks: Task[];
};

export default function StatusColumn(props: StatusColumnProps) {
  const { ref } = useDroppable({
    id: props.column.id,
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">{props.column.title}</h1>
      <div ref={ref} className="border bg-gray-200 w-100 h-100">
        {props.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
