import { DragDropProvider } from "@dnd-kit/react";
import StatusColumn from "@components/StatusColumn";
import Trash from "@components/Trash";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../api";
import type { Project } from "../types";
import { useProject } from "../projectContext";

type MoveTask = {
  taskUuid: string;
  listUuid: string;
};

export default function KanbanBoard() {
  const { currentProject } = useProject();
  const projectQueryKey = ["project", currentProject?.uuid] as const;

  const projectQuery = useQuery({
    queryKey: projectQueryKey,
    queryFn: () => api.get<Project>(`/api/project/${currentProject!.uuid}`),
    enabled: currentProject !== null,
  });

  const deleteTask = useMutation({
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

  const moveTask = useMutation({
    mutationFn: ({ taskUuid, listUuid }: MoveTask) =>
      api.patch(`/api/project/task/${taskUuid}/move/${listUuid}`),

    onMutate: async ({ taskUuid, listUuid }, context) => {
      await context.client.cancelQueries({ queryKey: projectQueryKey });
      const snapshot = context.client.getQueryData<Project>(projectQueryKey);
      context.client.setQueryData<Project>(
        projectQueryKey,
        (prev) =>
          prev && {
            ...prev,
            tasks: prev.tasks.map((task) =>
              task.uuid === taskUuid ? { ...task, listUuid } : task,
            ),
          },
      );
      return { snapshot };
    },

    onError: (err, _vars, onMutateResult, context) => {
      if (!onMutateResult) return;
      context.client.setQueryData<Project>(
        projectQueryKey,
        onMutateResult.snapshot,
      );
      console.error("Cannot move task", err);
    },
  });

  const [expandTrash, setExpandTrash] = useState(false);

  if (currentProject === null) {
    return (
      <div className="flex justify-center text-text-light/70">
        Select a project to view its board
      </div>
    );
  }

  if (projectQuery.isPending) {
    return <h1>Loading...</h1>;
  }

  if (projectQuery.isError) {
    return <h1>Error loading project</h1>;
  }

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        if (!event.operation.target) return;

        const taskUuid = event.operation.source?.id as string;
        const target = event.operation.target?.id as string;

        if (target === "trash") {
          deleteTask.mutate(taskUuid);
          setExpandTrash(false);
          return;
        }

        moveTask.mutate({ taskUuid, listUuid: target });
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
        {projectQuery.data.lists.map((list) => (
          <StatusColumn
            key={list.uuid}
            column={list}
            tasks={projectQuery.data.tasks.filter(
              (task) => task.listUuid === list.uuid,
            )}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <Trash expand={expandTrash} />
      </div>
    </DragDropProvider>
  );
}
