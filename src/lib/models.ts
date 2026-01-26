import { Edge, Node } from "@xyflow/react";
import { AbstractGraphType } from "./graph.utils";

export type Graph = {
  nodes?: Node[];
  edges?: Edge[];
  name: string;
  gtype: AbstractGraphType;
  viewport: {
    x: number,
    y: number,
    zoom: number
  }
};

export type Script = {
  raw?: string;
  name: string;
};

export type Project = {
  name: string,
  graphs?: Graph[],
  scripts?: Script[] 
};

export interface LocalProject {
  projectName: string;
  projectLocation: string;
};

export type GraphEvent<T> = {
  eventName: string;
  data?: T | null;
};