import { useDroppable } from "@dnd-kit/react";
import type { List, Project, Task } from "../types";
import TaskCard from "@components/TaskCard";
import { Plus as PlusIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import api from "../api";
import { useProject } from "../projectContext";
import { useState } from "react";

type StatusColumnProps = {
  column: List;
  tasks: Task[];
};

export default function StatusColumn(props: StatusColumnProps) {
  const { ref } = useDroppable({
    id: props.column.uuid,
  });

  const { currentProject } = useProject();
  const projectQueryKey = ["project", currentProject?.uuid] as const;
  const [newTaskUuid, setNewTaskUuid] = useState<string | null>(null);

  const { mutate: createTask } = useMutation({
    mutationFn: (newTask: Task) => api.post<void>("/api/project/task", newTask),

    onMutate: async (newTask, context) => {
      await context.client.cancelQueries({ queryKey: projectQueryKey });
      const snapshot = context.client.getQueryData<Project>(projectQueryKey);
      context.client.setQueryData<Project>(
        projectQueryKey,
        (prev) =>
          prev && {
            ...prev,
            tasks: [...prev.tasks, newTask],
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

    onSettled: async (_data, _error, _vars, _onMutateResult, context) => {
      await context.client.invalidateQueries({ queryKey: projectQueryKey });
    },
  });

  const handleAddTask = () => {
    const uuid = crypto.randomUUID();
    createTask({
      uuid,
      listUuid: props.column.uuid,
      text: "",
    });
    setNewTaskUuid(uuid);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-5">{props.column.title}</h1>

      <div
        ref={ref}
        className="group bg-raised rounded-2xl pt-8 px-4 w-100 h-200  flex flex-col gap-4"
      >
        {props.tasks.map((task) => (
          <TaskCard
            key={task.uuid}
            task={task}
            editing={task.uuid === newTaskUuid}
          />
        ))}

        <div className="flex justify-center">
          <button
            onClick={handleAddTask}
            className="invisible group-hover:visible hover:bg-fg rounded-lg py-1 px-2"
          >
            <PlusIcon className="opacity-40" />
          </button>
        </div>
      </div>
    </div>
  );
}
