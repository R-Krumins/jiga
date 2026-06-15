import { useState } from "react";
import { Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import type { Task } from "./types";
import api from "./api";
import { useListsQuery } from "./queries";

export default function AddTask() {
  const [newTaskName, setNewTaskName] = useState("");

  const listQuery = useListsQuery();
  let defaultListUuid = undefined;
  if (listQuery.data?.length > 0) {
    defaultListUuid = listQuery.data[0].uuid;
  }

  const { mutate } = useMutation({
    mutationFn: (newTask: Task) => api.post<Task>("/api/project/task", newTask),

    onMutate: async (newTask, context) => {
      await context.client.cancelQueries({ queryKey: ["tasks"] });
      context.client.setQueryData<Task[]>(["tasks"], (prev) => [
        ...prev,
        newTask,
      ]);
      return { newTaskUuid: newTask.uuid };
    },

    onError: (_err, _vars, { newTaskUuid }, context) => {
      context.client.setQueryData<Task[]>(["tasks"], (prev) =>
        prev.filter((task) => task.uuid !== newTaskUuid),
      );
    },

    // onSettled: (_data, _error, _vars, _onMutateResult, context) => {
    //   context.client.invalidateQueries({ queryKey: ["tasks"] });
    // },
  });

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (newTaskName.length === 0) return;
    setNewTaskName("");
    mutate({
      uuid: crypto.randomUUID() as string,
      text: newTaskName,
      listUuid: defaultListUuid,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center">
      <input
        type="text"
        name="add-task"
        id="add-task-field"
        placeholder="New task..."
        value={newTaskName}
        onChange={(e) => setNewTaskName(e.target.value)}
        className="bg-raised rounded-xl mr-2 px-4 py-2.5 w-80"
      />
      <button className="px-3 py-2 bg-accent rounded-xl">
        <Plus />
      </button>
    </form>
  );
}
