import { BaseNode, BaseNodeContent } from "@/components/base-node";
import { PluginForeignFunction } from "@/components/plugins/plugin.provider";
import { createNode, CreateNodeProps } from "@/lib/graph.utils";
import { Node, NodeProps } from "@xyflow/react";
import { memo } from "react";

export type ForeignFunctionNode = Node<{
  pluginName: string;
  functionName: string;
  function: PluginForeignFunction;
}>;

export const ForeignFunctionNode = memo(
  ({ data }: NodeProps<ForeignFunctionNode>) => {
    return (
      <BaseNode>
        <BaseNodeContent>FFI Node</BaseNodeContent>
        <BaseNodeContent>
          <pre
            className="bg-primary"
          >
            {JSON.stringify(data.function.schema, null, 2)}
          </pre>
        </BaseNodeContent>
      </BaseNode>
    );
  }
);

export const createForeignFunctionNode = (
  props: CreateNodeProps<ForeignFunctionNode>
) => {
  return createNode({
    ...props,
    type: "foreignFunctionNode",
  });
};

ForeignFunctionNode.displayName = "ForeignFunctionNode";
