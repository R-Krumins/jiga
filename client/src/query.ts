import { queryOptions } from "@tanstack/react-query";
import api from "./api";
import type { List } from "./types";

export const listsQueryOpt = queryOptions({
  queryKey: ["lists"],
  queryFn: () => api.get<List[]>("/api/project/list"),
});
