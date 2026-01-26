import { BaseNode, BaseNodeContent } from "@/components/base-node"
import { CreateNodeProps } from "@/lib/graph.utils";
import { Handle, Node, Position } from "@xyflow/react";
import { memo } from "react"

export type StartNode = Node<{}>;

export const StartNode = memo(() => {
    return (
        <BaseNode>
            <BaseNodeContent>Start Node</BaseNodeContent>
            <Handle type={"source"} position={Position.Right} />
        </BaseNode>
    )
});

export const createStartNode = (props: CreateNodeProps<StartNode>) => {
    return {
        id: props.id ?? "startNode",
        data: props.data ?? {},
        type: props.type ?? "startNode",
        position: props.position ?? {
            x: 0,
            y: 0
        }
    }
}

StartNode.displayName = "StartNode";