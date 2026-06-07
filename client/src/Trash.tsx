import { useDroppable } from "@dnd-kit/react";
import { Trash as TrashIcon } from "lucide-react";

type TrashProps = {
  expand: boolean;
};

export default function Trash({ expand }: TrashProps) {
  const { ref } = useDroppable({
    id: "trash",
  });
  return (
    <div
      ref={ref}
      className={`border-red-900 border-2 bg-red-400 min-w-20 min-h-10 flex items-center justify-center ${expand ? "w-80 h-20" : ""}`}
    >
      <TrashIcon className="text-red-900" />
    </div>
  );
}
