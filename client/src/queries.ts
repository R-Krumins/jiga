import { useQuery } from "@tanstack/react-query";
import api from "./api";
import type { List } from "./types";

export function useListsQuery() {
  return useQuery({
    queryKey: ["lists"],
    queryFn: () => api.get<List[]>("/api/project/list"),
  });
}
