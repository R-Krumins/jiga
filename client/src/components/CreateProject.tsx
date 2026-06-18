import { useSortable } from "@dnd-kit/react/sortable";
import { GripVertical, Plus, X as CloseIcon } from "lucide-react";
import { useState } from "react";

type ListItem = {
  id: string;
  index: number;
  name: string;
  editing: boolean;
};

const id = () => crypto.randomUUID();

export default function CreateProject() {
  const [listItems, setListItems] = useState<ListItem[]>([
    { id: id(), index: 0, name: "Todo", editing: false },
    { id: id(), index: 1, name: "In Progress", editing: false },
    { id: id(), index: 2, name: "Done", editing: false },
  ]);

  const handleNewList = () => {
    setListItems((prev) => [
      ...prev,
      {
        id: id(),
        index: prev.length,
        name: "",
        editing: true,
      },
    ]);
  };

  const handleSetEditing = (id: string, edit: boolean) => {
    setListItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, editing: edit } : p)),
    );
  };

  const handleSetName = (id: string, newName: string) => {
    setListItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName } : p)),
    );
  };

  const handleDelete = (id: string) => {
    setListItems((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="w-160 min-h-120 border bg-raised rounded-lg px-4 py-4">
      <h1>Project Name</h1>
      <input type="text" className="bg-bg p-2 rounded-xl mt-4" />
      <h1 className="pt-4">Lists</h1>
      <div className="mt-4 border rounded-xl p-2">
        <ul>
          {listItems.map((l) => (
            <ListItem
              key={l.id}
              {...l}
              setEditing={(editing) => handleSetEditing(l.id, editing)}
              setName={(newName) => handleSetName(l.id, newName)}
              delete={() => handleDelete(l.id)}
            />
          ))}
        </ul>
        <button className="w-48" onClick={handleNewList}>
          <Plus className="mx-auto" />
        </button>
      </div>

      <div className="flex justify-end mt-8">
        <button className="bg-bg rounded-xl py-3 px-5">Create</button>
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
  name,
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
          value={name}
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
          <p onDoubleClick={() => setEditing(true)}>{name}</p>

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
