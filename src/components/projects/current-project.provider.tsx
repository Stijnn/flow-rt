import { Graph, ProjectConfiguration, ProjectStructure } from "@/lib/models";
import { Fn } from "@/lib/types";
import { invoke } from "@tauri-apps/api/core";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type CurrentProjectState = {
  project: ProjectConfiguration;
  getGraphs: () => any[];
  getScripts: () => any[];
  addGraph: (props: GraphCreationProps) => Fn<void> | Fn<Graph>;
  addScript: (props: ScriptCreationProps) => Fn<void> | Fn<Graph>;
};

export type ScriptCreationProps = {};

export type GraphCreationProps = {};

const CurrentProjectContext = createContext<CurrentProjectState | null>(null);

export const CurrentProjectProvider = ({
  children,
  selectedProject,
}: {
  children: ReactNode;
  selectedProject: ProjectConfiguration;
}) => {
  const [currentProject, _] = useState<ProjectConfiguration>(selectedProject);
  const [structure, setStructure] = useState<ProjectStructure | null>(null);

  useEffect(() => {
    if (currentProject) {
      invoke<ProjectStructure>("build_project_structure", {
        root: currentProject.location,
      })
        .then((result) => {
          setStructure(result);
        })
        .catch((e) => console.error(e));
    }
  }, [currentProject]);

  const addScript = (props: ScriptCreationProps) => {};

  const addGraph = (props: GraphCreationProps) => {};

  return (
    <CurrentProjectContext.Provider
      value={{
        project: currentProject,
        getGraphs: () => {
          if (structure) {
            console.log(structure.files);
            return structure.files.filter((file) => file.extension === "jfg");
          }
          return [];
        },
        getScripts: () => {
          if (structure) {
            return structure.files.filter((file) => file.extension === "lua");
          }
          return [];
        },
        addGraph,
        addScript,
      }}
    >
      {children}
    </CurrentProjectContext.Provider>
  );
};

export const useCurrentProject = () => {
  const ctx = useContext(CurrentProjectContext);

  if (!ctx) {
    throw Error;
  }

  return ctx;
};
