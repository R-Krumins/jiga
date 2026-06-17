import { useState } from "react";
import { Plus } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Task } from "./types";
import api from "./api";
import { listsQueryOpt } from "./query";

export default function AddTask() {
  const [newTaskName, setNewTaskName] = useState("");

  const { data: defaultListUuid } = useQuery({
    ...listsQueryOpt,
    select: (data) => data[0].uuid,
  });

  const { mutate } = useMutation({
    mutationFn: (newTask: Task) => api.post<Task>("/api/project/task", newTask),

    onMutate: async (newTask, context) => {
      await context.client.cancelQueries({ queryKey: ["tasks"] });
      context.client.setQueryData<Task[]>(["tasks"], (prev) => [
        ...(prev ?? []),
        newTask,
      ]);
      return { newTaskUuid: newTask.uuid };
    },

    onError: (_err, _vars, onMutateResult, context) => {
      if (!onMutateResult) return;
      context.client.setQueryData<Task[]>(["tasks"], (prev) =>
        prev?.filter((task) => task.uuid !== onMutateResult.newTaskUuid),
      );
    },
  });

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (newTaskName.length === 0) return;
    if (!defaultListUuid) {
      throw new Error(
        "Cannot create new task because there is not default list to assign to",
      );
    }
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
