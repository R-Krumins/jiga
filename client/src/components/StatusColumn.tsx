import { useDroppable } from "@dnd-kit/react";
import type { List, Task } from "../types";
import TaskCard from "@components/TaskCard";

type StatusColumnProps = {
  column: List;
  tasks: Task[];
};

export default function StatusColumn(props: StatusColumnProps) {
  const { ref } = useDroppable({
    id: props.column.uuid,
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-5">{props.column.title}</h1>
      <div
        ref={ref}
        className="bg-raised w-100 h-200 rounded-2xl pt-8 px-4 flex flex-col gap-4"
      >
        {props.tasks.map((task) => (
          <TaskCard key={task.uuid} task={task} />
        ))}
      </div>
    </div>
  );
}
