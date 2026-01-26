import { Graph, Project } from "@/lib/models";
import { Fn } from "@/lib/types";
import { createContext, ReactNode, useContext, useState } from "react";

type CurrentProjectState = {
    project: Project;
    addGraph: (props: GraphCreationProps) => Fn<void> | Fn<Graph>;
    addScript: (props: ScriptCreationProps) => Fn<void> | Fn<Graph>;
}

export type ScriptCreationProps = {

}

export type GraphCreationProps = {

}

const CurrentProjectContext = createContext<CurrentProjectState | null>(null);

export const CurrentProjectProvider = ({ children, selectedProject }: { children: ReactNode, selectedProject: Project }) => {
    const [currentProject, _] = useState<Project>(selectedProject);

    const addScript = (props: ScriptCreationProps) => {

    }

    const addGraph = (props: GraphCreationProps) => {

    }

    return (
        <CurrentProjectContext.Provider value={{
            project: currentProject,
            addGraph,
            addScript
        }}>
            { children }
        </CurrentProjectContext.Provider>
    );
}

export const useCurrentProject = () => {
    const ctx = useContext(CurrentProjectContext);

    if (!ctx) {
        throw Error
    }

    return ctx;
}