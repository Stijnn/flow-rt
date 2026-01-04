import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "sonner";

export interface Project {
  name: string;
}

type ProjectsContextProps = {
  projects: Project[];
  isEmpty: boolean;
} | null;

const ProjectsContext = createContext<ProjectsContextProps>(null);

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);

  return (
    <ProjectsContext.Provider
      value={{ projects, isEmpty: projects.length === 0 }}
    >
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => {
  const ctx = useContext(ProjectsContext);

  if (!ctx) {
    const eMessage = "useProjects can only be used within a ProjectsProvider";
    toast.error(eMessage);
    throw new Error(eMessage);
  }

  return ctx;
};
