import {
  ChevronDown as DownArrow,
  Plus as AddIcon,
  Search as SearchIcon,
  Pencil as EditIcon,
} from "lucide-react";
import { Dialog, Popover } from "radix-ui";
import { useState } from "react";
import clsx from "clsx";
import CreateProject from "./CreateProject";
import SelectProject from "./SelectProject";
import { useProject } from "../projectContext";

export default function ProjectManager() {
  const { currentProject } = useProject();
  const [selectProjOpen, setSelectProjOpen] = useState(false);
  const [createProjOpen, setCreateProjOpen] = useState(false);

  const onOpenCreateProjChange = (open: boolean) => {
    setCreateProjOpen(open);
    open && setSelectProjOpen(false);
  };

  return (
    <Dialog.Root open={createProjOpen} onOpenChange={onOpenCreateProjChange}>
      <Popover.Root open={selectProjOpen} onOpenChange={setSelectProjOpen}>
        <Popover.Trigger>
          <SelectProjBtn
            arrowUp={selectProjOpen}
            text={currentProject?.title ?? "Select Project"}
          />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content align="start">
            <div className="w-60 mt-4 px-2 py-2 rounded-lg bg-raised">
              <SelectProject onSelectProject={() => setSelectProjOpen(false)} />
              <div className="flex flex-col gap-2 mt-4">
                <Dialog.Trigger>
                  <NewProjBtn />
                </Dialog.Trigger>
                <EditProjBtn />
              </div>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/40 fixed inset-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <CreateProject />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SelectProjBtn(props: { text: string; arrowUp: boolean }) {
  return (
    <button className="text-xl font-semibold flex items-center gap-2 rounded-xl py-1 px-4 transition-colors hover:bg-white/5">
      <h1>{props.text}</h1>
      <DownArrow
        className={clsx("translate-y-0.5", props.arrowUp && "rotate-180")}
      />
    </button>
  );
}

function NewProjBtn() {
  return (
    <button className="flex gap-1 items-center text-text-light/70">
      <AddIcon className="size-5" />
      <p className="text-sm">New</p>
    </button>
  );
}

function EditProjBtn() {
  return (
    <button className="flex gap-1 items-center text-text-light/70">
      <EditIcon className="size-4" />
      <p className="text-sm ml-1">Edit Current</p>
    </button>
  );
}
