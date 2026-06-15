import { DragDropProvider } from "@dnd-kit/react";
import StatusColumn from "./StatusColumn";
import Trash from "./Trash";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "./api";
import type { List, Task } from "./types";
import { useListsQuery } from "./queries";

type MoveTask = {
  taskUuid: string;
  listUuid: string;
};

export default function KanbanBoard() {
  const taskQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: () => api.get<Task[]>("/api/project/task"),
  });

  const deleteTask = useMutation({
    mutationFn: (uuid: string) => api.delete(`/api/project/task/${uuid}`),

    onMutate: async (deletedTaskUuid, context) => {
      await context.client.cancelQueries({ queryKey: ["tasks"] });
      const snapshot = context.client.getQueryData<Task[]>(["tasks"]);
      context.client.setQueryData<Task[]>(
        ["tasks"],
        (prev) => prev?.filter((task) => task.uuid !== deletedTaskUuid) ?? [],
      );
      return { snapshot };
    },

    onError: (_err, _vars, { snapshot }, context) => {
      context.client.setQueryData<Task[]>(["tasks"], snapshot);
    },
  });

  const moveTask = useMutation({
    mutationFn: ({ taskUuid, listUuid }: MoveTask) =>
      api.patch(`/api/project/task/${taskUuid}/move/${listUuid}`),

    onMutate: async ({ taskUuid, listUuid }, context) => {
      await context.client.cancelQueries({ queryKey: ["tasks"] });
      const snapshot = context.client.getQueryData<Task[]>(["tasks"]);
      context.client.setQueryData<Task[]>(["tasks"], (prev) =>
        prev.map((task) =>
          task.uuid === taskUuid ? { ...task, listUuid } : task,
        ),
      );
      return { snapshot };
    },

    onError: (err, _vars, { snapshot }, context) => {
      context.client.setQueryData<Task[]>(["tasks"], snapshot);
      console.error("Cannot move task", err);
    },
  });

  const listQuery = useListsQuery();

  const [expandTrash, setExpandTrash] = useState(false);

  if (taskQuery.isPending || listQuery.isPending) {
    return <h1>Loading...</h1>;
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
        {listQuery.data.map((list) => (
          <StatusColumn
            key={list.uuid}
            column={list}
            tasks={taskQuery.data.filter((task) => task.listUuid === list.uuid)}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <Trash expand={expandTrash} />
      </div>
    </DragDropProvider>
  );
}
