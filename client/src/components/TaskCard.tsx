import { useState, useRef, useEffect } from "react";
import { useDraggable } from "@dnd-kit/react";
import type { Task } from "../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { useProject } from "../projectContext";

type TaskCardProps = {
  task: Task;
};

export default function TaskCard({ task }: TaskCardProps) {
  const { currentProject } = useProject();

  const queryClient = useQueryClient();

  const taskTextMutation = useMutation({
    mutationFn: (text: string) =>
      api.put("/api/project/task", { ...task, text }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["project", currentProject?.uuid],
      });
    },
  });
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const { ref } = useDraggable({
    id: task.uuid,
    disabled: editing,
  });

  const handleUpdateTaskText = () => {
    setEditing(false);
    taskTextMutation.mutate(editText.trim());
  };

  return (
    <div ref={ref} className="bg-fg rounded-2xl flex">
      <div className="w-4 bg-blue-600 rounded-l-2xl" />

      <div className="inline-block pl-6 py-4">
        {editing ? (
          <input
            autoFocus
            placeholder="task name..."
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={() => {
              setEditing(false);
              setEditText(task.text);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleUpdateTaskText();
              }
            }}
          />
        ) : (
          <p onDoubleClick={() => setEditing(true)}>
            {taskTextMutation.isPending ? editText : task.text}
          </p>
        )}
      </div>
    </div>
  );
}
