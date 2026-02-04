import { Project, ProjectConfiguration } from "@/lib/models";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { CurrentProjectProvider } from "./current-project.provider";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { useNavigate } from "react-router";

type ProjectsContextProps = {
  projects: ProjectConfiguration[];
  isEmpty: boolean;
  refreshProjects: () => Promise<void> | void;
} | null;

const ProjectsContext = createContext<ProjectsContextProps>(null);

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const nav = useNavigate();
  const [projects, setProjects] = useState<ProjectConfiguration[]>([]);
  const [unlistenFunctionArray, setUnlistenFunctionArray] = useState<UnlistenFn[]>([]); 

  const [selectedProject, setSelectedProject] = useState<Project | undefined>(
    undefined
  );

  const refreshProjects = () => {
    invoke<ProjectConfiguration[]>("get_all_projects").then((allProjects) => setProjects((_) => [...allProjects])).catch((e) => {
      console.error(e);
    });
  }

  useEffect(() => {
    refreshProjects();

    listen<ProjectConfiguration | undefined>("on_current_project_changed", (ev) => {
      setSelectedProject((_) => ev.payload);
      if (ev.payload) {
        nav("/editor");
      } else {
        nav("/");
      }
    }).then((fn) => setUnlistenFunctionArray((prev) => [...prev, fn]));

    return () => {
      unlistenFunctionArray.forEach((f) => f());
    }
  }, []);

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        isEmpty: projects.length === 0,
        refreshProjects
      }}
    >
      {selectedProject && (
        <CurrentProjectProvider selectedProject={selectedProject}>
          {children}
        </CurrentProjectProvider>
      )}
      {!!!selectedProject && children}
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
