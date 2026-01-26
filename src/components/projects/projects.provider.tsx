import { LocalProject, Project } from "@/lib/models";
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

type ProjectsContextProps = {
  projects: LocalProject[];
  isEmpty: boolean;
  selectedProject: boolean;
  addProject: (project: LocalProject) => Promise<void> | void;
  setProject: (project: LocalProject) => Promise<void> | void;
  clearProject: () => Promise<void> | void;
} | null;

const ProjectsContext = createContext<ProjectsContextProps>(null);

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<LocalProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(
    undefined
  );

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem("--local-projects", JSON.stringify(projects));
    }
  }, [projects]);

  useEffect(() => {
    const localProjectsStr = localStorage.getItem("--local-projects");
    if (localProjectsStr) {
      setProjects(JSON.parse(localProjectsStr) as LocalProject[]);
    }
  }, []);

  const setProject = async (localProject: LocalProject) => {
    const data = await invoke<Project>("load_project", {
      project: {
        name: localProject.projectName,
      },
    });
    setSelectedProject(data);
  };

  const addProject = async (project: LocalProject) => {
    if (
      projects.filter(
        (prev) => prev.projectLocation === project.projectLocation
      ).length > 1
    ) {
      return;
    }
    setProjects((prev) => [...prev, project]);
  };

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        isEmpty: projects.length === 0,
        addProject,
        setProject,
        selectedProject: selectedProject !== null && selectedProject !== undefined,
        clearProject() {
          setSelectedProject(undefined);
        },
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
