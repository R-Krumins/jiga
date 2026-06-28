import { useState, useRef, useEffect } from "react";
import { useDraggable } from "@dnd-kit/react";
import type { Project, Task } from "../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { useProject } from "../projectContext";
import { ContextMenu } from "radix-ui";

type TaskCardProps = {
  task: Task;
  editing?: boolean;
};

export default function TaskCard(props: TaskCardProps) {
  const { currentProject } = useProject();
  const projectQueryKey = ["project", currentProject?.uuid] as const;

  const queryClient = useQueryClient();

  const taskTextMutation = useMutation({
    mutationFn: (text: string) =>
      api.put("/api/project/task", { ...props.task, text }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["project", currentProject?.uuid],
      });
    },
  });

  const { mutate: deleteTask } = useMutation({
    mutationFn: (uuid: string) => api.delete(`/api/project/task/${uuid}`),

    onMutate: async (deletedTaskUuid, context) => {
      await context.client.cancelQueries({ queryKey: projectQueryKey });
      const snapshot =
        context.client.getQueryData<Project>(projectQueryKey) ?? null;
      context.client.setQueryData<Project>(
        projectQueryKey,
        (prev) =>
          prev && {
            ...prev,
            tasks: prev.tasks.filter((task) => task.uuid !== deletedTaskUuid),
          },
      );
      return { snapshot };
    },

    onError: (_err, _vars, onMutateResult, context) => {
      if (!onMutateResult?.snapshot) return;
      context.client.setQueryData<Project>(
        projectQueryKey,
        onMutateResult.snapshot,
      );
    },
  });

  const [editing, setEditing] = useState(props.editing ?? false);
  const [editText, setEditText] = useState(props.task.text);

  const { ref } = useDraggable({
    id: props.task.uuid,
    disabled: editing,
  });

  const handleUpdateTaskText = () => {
    setEditing(false);
    taskTextMutation.mutate(editText.trim());
  };

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
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
                  setEditText(props.task.text);
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
                {taskTextMutation.isPending ? editText : props.task.text}
              </p>
            )}
          </div>
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="bg-raised rounded-2xl px-6 py-3">
          <ContextMenu.Item onSelect={() => setEditing(true)}>
            Edit
          </ContextMenu.Item>
          <ContextMenu.Item onSelect={() => deleteTask(props.task.uuid)}>
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
