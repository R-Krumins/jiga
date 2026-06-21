import { useQuery } from "@tanstack/react-query";
import api from "../api";
import { useProject } from "../projectContext";

type Props = {
  onSelectProject: () => void;
};

export default function SelectProject(props: Props) {
  const { setCurrentProject } = useProject();
  const { data, isError, isPending } = useQuery({
    queryKey: ["project", "names"],
    queryFn: () =>
      api.get<{ uuid: string; title: string }[]>("/api/project/names"),
  });

  if (isPending) {
    return <p>Fething ...</p>;
  }

  if (isError) {
    return <p>Error fetching projects</p>;
  }

  return (
    <div className="">
      <div className="flex gap-1">
        <input
          className="w-full bg-bg/40 rounded-lg px-2 py-0.5"
          type="text"
          placeholder="search..."
        />
      </div>

      <ul className="mt-4 mb-2 space-y-1">
        {data.map(({ uuid, title }) => (
          <li>
            <button
              onClick={() => {
                setCurrentProject({ uuid, title });
                props.onSelectProject();
              }}
              className="hover:bg-text-light/70 rounded-lg w-fit py-1 px-2"
            >
              {title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
