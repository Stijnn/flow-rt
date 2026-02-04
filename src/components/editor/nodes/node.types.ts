import { ForeignFunctionNode } from "./foreign-function.node.component";
import { ScriptNode } from "./script.node.component";
import { StartNode } from "./start.node.component";

const nodeTypes = {
    startNode: StartNode,
    scriptNode: ScriptNode,
    foreignFunctionNode: ForeignFunctionNode
};

export const getNodeTypes = () => nodeTypes;