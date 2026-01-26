import { ScriptNode } from "./script.node.component";
import { StartNode } from "./start.node.component";

const nodeTypes = {
    startNode: StartNode,
    scriptNode: ScriptNode,
};

export const getNodeTypes = () => nodeTypes;