import { ChevronDown as DownArrow, Search as SearchIcon } from "lucide-react";
import { Popover } from "radix-ui";
import { useState } from "react";
import clsx from "clsx";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex px-8 pt-4">
      <Popover.Root onOpenChange={setIsOpen}>
        <Popover.Trigger>
          <button className="text-xl font-semibold flex items-center gap-2 rounded-xl py-1 px-4 transition-colors hover:bg-white/5">
            <h1>Finyahu</h1>
            <DownArrow
              className={clsx("translate-y-0.5", isOpen && "rotate-180")}
            />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content align="start">
            <div className="w-60 mt-4 border px-2 py-2 rounded-lg bg-raised">
              <div className="flex gap-1">
                <input className="w-full border rounded-lg" type="text" />
                <SearchIcon />
              </div>

              <div className="mt-2">
                <h1>Hello there</h1>
                <h1>Hello there</h1>
                <h1>Hello there</h1>
                <h1>Hello there</h1>
                <h1>Hello there</h1>
                <h1>{isOpen ? "true" : "false"}</h1>
              </div>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
