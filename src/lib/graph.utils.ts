import { getBezierPath, getSimpleBezierPath, getSmoothStepPath, getStraightPath, Node } from "@xyflow/react";
import { Graph } from "./models";
import { v4 } from "uuid";

export type AbstractGraphType =  "eventGraph" | "fnGraph";
export type AbstractNodeType = "eventListener" | "eventTrigger" | "fnEntry" | "fnTrigger";
export type PrimitiveHandleType = "string" | "number" | "array" | "object";

export const createNode = <T extends Node<Record<string, unknown>, string | undefined>>(props: CreateNodeProps<T>) => {
    return {
        ...props,
        id: props.id ?? `node_${props.type}_${v4()}`,
        data: props.data ?? {},
        position: props.position ?? {
            x: 0,
            y: 0
        }
    } as T;
}

export type NewEventGraphData = {
    triggeredBy: string
}

export type NewFunctionGraphData = {
    schema: Record<string, PrimitiveHandleType>
}

export type CreateGraphPropsDataType = NewEventGraphData | NewFunctionGraphData;

export type CreateGraphProps = {
    name: string;
    graphType: AbstractGraphType;
    data: CreateGraphPropsDataType;
}

/**
 * Creates a Graph object.
 * 
 * @param props properties required to create a graph.
 * @returns A graph created based on the given properties.
 */
export const createGraph = (props: CreateGraphProps) => {
    const baseObject = {
        name: props.name,
        gtype: props.graphType,
    } as Graph;
    
    switch (props.graphType) {
        case "eventGraph": {
            const propsData = props.data as { triggeredBy: string };
            return {
                ...baseObject,
                nodes: [
                    createNode({
                        type: "eventListener",
                        data: {
                            triggeredBy: propsData.triggeredBy
                        },
                        position: {
                            x: 0,
                            y: 0,
                        }
                    })
                ]
            } as Graph
        }
        case "fnGraph": {
            const propsData = props.data as { schema: Record<string, PrimitiveHandleType> };
            return {
                ...baseObject,
                nodes: [
                    createNode({
                        type: "fnEntry",
                        data: {
                            schema: propsData.schema
                        },
                        position: {
                            x: 0,
                            y: 0,
                        }
                    })
                ]
            }
        }
    }
}

export type CreateNodeProps<T extends Node<Record<string, unknown>, string | undefined>> = {
    position: { x: number; y: number };
} & Partial<T>;

export type EdgeStyleType = "straight" | "bezier" | "simplebezier" | "step";

export const PATH_GENERATORS = {
  straight: getStraightPath,
  bezier: getBezierPath,
  simplebezier: getSimpleBezierPath,
  step: getSmoothStepPath,
} as const;