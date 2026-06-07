import type { Project } from "./types";

export async function getProject(): Promise<Project> {
  const res = await fetch("/api/project");
  if (!res.ok) throw new Error("Could not fetch project");
  return res.json();
}
