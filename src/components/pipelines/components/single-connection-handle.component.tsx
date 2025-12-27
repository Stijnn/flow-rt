import { LabeledHandle } from "@/components/labeled-handle";
import { HandleProps, useNodeConnections } from "@xyflow/react";
import { ComponentProps } from "react";

export const SingleConnectionHandle = (
  props: HandleProps &
    ComponentProps<"div"> & {
      title: string;
      handleClassName?: string;
      labelClassName?: string;
    }
) => {
  const connections = useNodeConnections({
    handleType: props.type,
  });

  return <LabeledHandle {...props} isConnectable={connections.length < 1} />;
};
