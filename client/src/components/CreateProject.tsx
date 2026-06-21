import { useSortable } from "@dnd-kit/react/sortable";
import { useMutation } from "@tanstack/react-query";
import { GripVertical, Plus, X as CloseIcon } from "lucide-react";
import { useState } from "react";
import api from "../api";
import type { Project } from "../types";

type ListItem = {
  id: string;
  index: number;
  editing: boolean;
  title: string;
};

type NewProject = {
  uuid: string;
  title: string;
};

const uuid = () => crypto.randomUUID();

export default function CreateProject() {
  const { mutate: createProject } = useMutation({
    mutationFn: async (newProj: Project) => api.post("/api/project", newProj),
  });

  const [project, setProject] = useState<NewProject>({
    uuid: uuid(),
    title: "",
  });

  const [listItems, setListItems] = useState<ListItem[]>([
    { id: uuid(), index: 0, title: "Todo", editing: false },
    { id: uuid(), index: 1, title: "In Progress", editing: false },
    { id: uuid(), index: 2, title: "Done", editing: false },
  ]);

  const canCreateProject =
    project.title.length !== 0 &&
    listItems.every((l) => l.title.trim().length !== 0);

  const handleNewList = () => {
    setListItems((prev) => [
      ...prev,
      {
        id: uuid(),
        index: Math.max(...prev.map((l) => l.index)) + 1,
        title: "",
        editing: true,
      },
    ]);
  };

  const handleSetListEditing = (id: string, edit: boolean) => {
    setListItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, editing: edit } : p)),
    );
  };

  const handleSetListTitle = (id: string, newTitle: string) => {
    setListItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title: newTitle } : p)),
    );
  };

  const handleDeleteList = (id: string) => {
    setListItems((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCreateProject = () => {
    const newProject: Project = {
      uuid: project.uuid,
      title: project.title,
      tasks: [],
      lists: listItems.map((l) => ({
        uuid: l.id,
        title: l.title.trim(),
      })),
    };

    createProject(newProject);
  };

  return (
    <div className="w-160 min-h-120 border bg-raised rounded-lg px-4 py-4">
      <h1>Project Name</h1>
      <input
        type="text"
        value={project.title}
        onChange={(e) =>
          setProject((prev) => ({ ...prev, title: e.target.value.trim() }))
        }
        className="bg-bg p-2 rounded-xl mt-4"
      />
      <h1 className="pt-4">Lists</h1>
      <div className="mt-4 border rounded-xl p-2">
        <ul>
          {listItems.map((l) => (
            <ListItem
              key={l.id}
              {...l}
              setEditing={(editing) => handleSetListEditing(l.id, editing)}
              setName={(newName) => handleSetListTitle(l.id, newName)}
              delete={() => handleDeleteList(l.id)}
            />
          ))}
        </ul>
        <button className="w-48" onClick={handleNewList}>
          <Plus className="mx-auto" />
        </button>
      </div>

      <div className="flex justify-end mt-8">
        <button
          disabled={!canCreateProject}
          className="bg-bg rounded-xl py-3 px-5"
          onClick={handleCreateProject}
        >
          Create
        </button>
      </div>
    </div>
  );
}

type ListItemProps = ListItem & {
  setEditing: (editing: boolean) => void;
  setName: (newName: string) => void;
  delete: () => void;
};

function ListItem({
  id,
  index,
  title,
  editing,
  setEditing,
  setName: onNameChange,
  delete: onDelete,
}: ListItemProps) {
  const { ref, handleRef } = useSortable({ id, index });

  return (
    <li
      ref={ref}
      className="bg-zinc-700 w-64 my-2 p-3 flex justify-between rounded-xl"
    >
      {editing ? (
        <input
          value={title}
          placeholder="List name..."
          onChange={(e) => onNameChange(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") {
              e.preventDefault();
              setEditing(false);
            }
          }}
          autoFocus
          className="bg-transparent outline-none"
        />
      ) : (
        <>
          <p onDoubleClick={() => setEditing(true)}>{title}</p>

          <div className="flex gap-2">
            <button ref={handleRef}>
              <GripVertical className="stroke-1 size-5 opacity-60" />
            </button>
            <button onClick={() => onDelete()}>
              <CloseIcon className="stroke-2 size-5 opacity-60" />
            </button>
          </div>
        </>
      )}
    </li>
  );
}
