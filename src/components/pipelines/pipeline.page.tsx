import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";

import { NodeTypes } from "./nodes/nodes.module";

import { useCallback } from "react";
import { Button } from "../ui/button";
import { EventNode } from "./nodes/event-node.component";
import { NativeFunctionsProvider } from "./native-functions.provider";

export const PipelinePage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      type: "computeNode",
      id: "doSomethingNode",
      data: {},
      position: {
        x: 0,
        y: 0,
      },
    },
    {
      type: "nativeComputeNode",
      id: "doSomething-nativeNode",
      data: {},
      position: {
        x: 0,
        y: 0,
      },
    },
    {
      type: "eventNode",
      id: "startNode",
      data: {
        eventName: "test",
      },
      position: {
        x: 0,
        y: 0,
      },
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const launchPipeline = (eventName: string) => {
    nodes
      .filter((n) => n.type === "eventNode")
      .map((n) => {
        console.log(n);
        return n;
      })
      .map((n) => n as EventNode)
      .filter((n) => n.data.eventName === eventName)
      .forEach((n) => n.data.onInvoke?.call(this));
  };

  return (
    <NativeFunctionsProvider>
      <div className="flex flex-col w-full h-full">
        <Button onClick={() => launchPipeline("test")}>Run</Button>
        <ReactFlowProvider>
          <ReactFlow
            className="flex-1"
            proOptions={{
              hideAttribution: false,
            }}
            colorMode="dark"
            nodes={nodes}
            edges={edges}
            nodeTypes={NodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Controls />
            <MiniMap position={"top-right"} />
            <Background variant={BackgroundVariant.Dots} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </NativeFunctionsProvider>
  );
};
