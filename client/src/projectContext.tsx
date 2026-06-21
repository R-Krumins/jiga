import { createContext, useContext, useState, type ReactNode } from "react";

type Project = {
  uuid: string;
  title: string;
};

export type ProjectContextValue = {
  currentProject: Project | null;
  setCurrentProject: (project: Project) => void;
};

const ProjectContext = createContext<ProjectContextValue | undefined>(
  undefined,
);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectContext, setProjectContext] = useState<Project | null>(null);

  const setCurrentProject = (project: NonNullable<Project>) => {
    setProjectContext(project);
  };

  return (
    <ProjectContext.Provider
      value={{ currentProject: projectContext, setCurrentProject }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);

  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }

  return context;
}
