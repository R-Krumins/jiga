import { useDraggable } from "@dnd-kit/react";
import type { Task } from "./types";

type TaskCardProps = {
  task: Task;
};

export default function TaskCard(props: TaskCardProps) {
  const { ref } = useDraggable({
    id: props.task.id,
  });
  return (
    <div ref={ref} className="bg-yellow-300 border p-2">
      {props.task.text}
    </div>
  );
}
