import { useDroppable } from "@dnd-kit/react";
import type { List, Task } from "../types";
import TaskCard from "@components/TaskCard";
import { Plus as PlusIcon } from "lucide-react";

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
        className="group bg-raised rounded-2xl pt-8 px-4 w-100 h-200  flex flex-col gap-4"
      >
        {props.tasks.map((task) => (
          <TaskCard key={task.uuid} task={task} />
        ))}

        <div className="flex justify-center">
          <button className="invisible group-hover:visible hover:bg-fg rounded-lg py-1 px-2">
            <PlusIcon className="opacity-40" />
          </button>
        </div>
      </div>
    </div>
  );
}
