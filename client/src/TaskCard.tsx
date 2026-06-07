import { useState, useRef, useEffect } from "react";
import { useDraggable } from "@dnd-kit/react";
import { useProject } from "./ProjectContext";
import type { Task } from "./types";

type TaskCardProps = {
  task: Task;
};

export default function TaskCard({ task }: TaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.text);
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateTask } = useProject();

  const { ref } = useDraggable({
    id: task.id,
    disabled: editing,
  });

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const save = () => {
    if (draft.trim() && draft !== task.text) {
      updateTask(task.id, draft.trim());
    } else {
      setDraft(task.text);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="bg-yellow-300 border p-2">
        <input
          ref={inputRef}
          className="w-full bg-white border px-1"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="bg-yellow-300 border p-2"
      onDoubleClick={() => {
        setDraft(task.text);
        setEditing(true);
      }}
    >
      {task.text}
    </div>
  );
}
