import {
  BaseNode,
  BaseNodeFooter,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/components/base-node";
import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { useEffect } from "react";

import {
  ComputeFunctionProps,
  ComputeNodeData,
} from "./compute-node.component";
import { SingleConnectionHandle } from "../components/single-connection-handle.component";
import { useNativeFunctions } from "../native-functions.provider";

export type NativeComputeInput<T> = T & {};
export type NativeComputeFunctionProps = {} & ComputeFunctionProps;

export type NativeComputeNodeData = {
  computeFunction?: ({
    callerId,
  }: NativeComputeFunctionProps) => Promise<any> | any;
};

export type NativeComputeNode = Node<NativeComputeNodeData>;

export const NativeComputeNode = ({
  id,
  data,
}: NodeProps<NativeComputeNode>) => {
  const { updateNodeData, getNode, getNodeConnections } = useReactFlow();
  const { invokeFunction } = useNativeFunctions();

  const nextInComputeChain = () => {
    getNodeConnections({ type: "source", nodeId: id })
      .map((nodeConnection) => getNode(nodeConnection.target))
      .map((n) => n?.data as ComputeNodeData)
      .forEach(async (nd) => {
        if (nd.computeFunction) {
          await nd.computeFunction.call(this, { callerId: id });
        }
      });
  };

  const onCompute = ({ callerId }: NativeComputeFunctionProps) => {
    console.log(`Native Compute ${id} called from ${callerId}`);
    invokeFunction({
      functionName: "nmap",
      context: {
        arguments: ["127.0.0.1", "-sA"],
      },
    });
    nextInComputeChain();
  };

  useEffect(() => {
    updateNodeData(id, { ...data, computeFunction: onCompute });
  }, []);

  return (
    <BaseNode>
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>Native Compute Node</BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeFooter className="grid px-0">
        <SingleConnectionHandle
          id="target-1"
          type="target"
          position={Position.Left}
          title={"Run"}
        />
        <SingleConnectionHandle
          id="source-1"
          type="source"
          position={Position.Right}
          title={"Next"}
        />
      </BaseNodeFooter>
    </BaseNode>
  );
};
