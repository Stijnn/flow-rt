import { BaseNode, BaseNodeContent } from "@/components/base-node"
import { CreateNodeProps } from "@/lib/graph.utils";
import { Handle, Node, Position } from "@xyflow/react";
import { memo } from "react"
import { v4 } from "uuid";

export type ScriptNode = Node<{}>;

export const ScriptNode = memo(() => {
    return (
        <BaseNode>
            <BaseNodeContent>Script Node</BaseNodeContent>
            <Handle type={"target"} position={Position.Left} />
            <Handle type={"source"} position={Position.Right} />
        </BaseNode>
    )
});

export const createScriptNode = (props: CreateNodeProps<ScriptNode>) => {
    return {
        id: props.id ?? `scriptNode-${v4()}`,
        data: props.data ?? {},
        type: props.type ?? "scriptNode",
        position: props.position ?? {
            x: 0,
            y: 0
        }
    }
}

ScriptNode.displayName = "ScriptNode";