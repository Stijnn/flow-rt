import { useTheme } from "@/components/theme-provider";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  addEdge,
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodes,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import {
  CursorPositionProvider,
  useCursorPosition,
} from "../hooks/use-cursor-position.provider";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { createStartNode, StartNode } from "../nodes/start.node.component";
import { CustomEdge } from "../edges/custom.edge.component";
import { createScriptNode, ScriptNode } from "../nodes/script.node.component";
import { Button } from "@/components/ui/button";
import { SaveIcon } from "lucide-react";
import { useDialogManager } from "@/components/dialogs/dialog.provider";
import { GraphJsonDialog } from "../dialogs/graph-json.dialog.component";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

import { getNodeTypes } from "../nodes/node.types";
import { getEdgeTypes } from "../edges/edge.types";
import { usePlugins } from "@/components/plugins/plugin.provider";
import { createForeignFunctionNode } from "../nodes/foreign-function.node.component";

const GraphEditorContextMenu = () => {
  const reactFlow = useReactFlow();
  const { getFlowPosition } = useCursorPosition();
  const { plugins } = usePlugins();

  return (
    <ContextMenuContent className="overflow-hidden">
      <ContextMenuSub>
        <ContextMenuSubTrigger>Add Node</ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem
            onClick={() => {
              reactFlow.addNodes(
                createStartNode({
                  position: getFlowPosition(),
                })
              );
            }}
          >
            Start Node
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              reactFlow.addNodes(
                createScriptNode({
                  position: getFlowPosition(),
                })
              );
            }}
          >
            Script Node
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuLabel>Libraries</ContextMenuLabel>
          {plugins.map((plugin) => {
            return (
              <>
                <ContextMenuSub>
                  <ContextMenuSubTrigger>{plugin.name}</ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    {[...Object.keys(plugin.functions)].map((v, i) => {
                      const desc = Object.values(plugin.functions)[i];
                      return (
                        <ContextMenuItem
                          onClick={() => {
                            reactFlow.addNodes(
                              createForeignFunctionNode({
                                data: {
                                  pluginName: plugin.name,
                                  functionName: v,
                                  function: desc
                                },
                                position: getFlowPosition(),
                              })
                            );
                          }}
                        >
                          {v}
                        </ContextMenuItem>
                      );
                    })}
                  </ContextMenuSubContent>
                </ContextMenuSub>
              </>
            );
          })}
        </ContextMenuSubContent>
      </ContextMenuSub>
    </ContextMenuContent>
  );
};

const SaveToJsonPanel = () => {
  const reactFlow = useReactFlow();
  const { addDialog } = useDialogManager();

  return (
    <Panel>
      <Button
        variant={"outline"}
        onClick={() => {
          addDialog(() => <GraphJsonDialog object={reactFlow.toObject()} />);
        }}
      >
        <SaveIcon />
        Export
      </Button>
    </Panel>
  );
};

export const SearchNode = ({ children }: { children: ReactNode }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState<string | undefined>(undefined);
  const [nodeReferences, setNodeReferences] = useState<Node[]>([]);
  const rf = useReactFlow();

  const focusNode = (node: Node) => {
    if (node && node.measured) {
      const x = node.position.x + (node.measured.width ?? 0) / 2;
      const y = node.position.y + (node.measured.height ?? 0) / 2;

      rf.setCenter(x, y, { zoom: 1.2, duration: 800 });
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "f") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!searchText) {
      setNodeReferences([]);
      return;
    }

    const nodes = rf
      .getNodes()
      .filter((n) => n.id.includes(searchText) || n.type?.includes(searchText));

    setNodeReferences(nodes);
  }, [searchText]);

  return (
    <>
      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <CommandInput
          placeholder="Enter a node name or ID..."
          onValueChange={(v) => setSearchText(v === "" ? undefined : v)}
        />
        <CommandList>
          {nodeReferences.length > 0 && (
            <CommandGroup heading="Nodes">
              {nodeReferences.map((node) => (
                <CommandItem
                  onSelect={() => {
                    focusNode(node);
                    setIsSearchOpen(false);
                  }}
                >
                  {node.id}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandEmpty>No nodes found.</CommandEmpty>
          <CommandSeparator />
          <CommandGroup heading="Suggestions">
            <CommandItem>Entry point</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      {children}
    </>
  );
};

export const EditorGraphPage = () => {
  const { theme } = useTheme();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onConnect = useCallback(
    (params: any) =>
      setEdges((eds) => addEdge({ ...params, type: "customEdge" }, eds)),
    []
  );

  return (
    <ReactFlowProvider>
      <CursorPositionProvider>
        <SearchNode>
          <ContextMenu>
            <ContextMenuTrigger>
              <ReactFlow
                nodeTypes={getNodeTypes()}
                edgeTypes={getEdgeTypes()}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                colorMode={theme}
              >
                <MiniMap />
                <Background />
                <Controls />
                <SaveToJsonPanel />
              </ReactFlow>
            </ContextMenuTrigger>
            <GraphEditorContextMenu />
          </ContextMenu>
        </SearchNode>
      </CursorPositionProvider>
    </ReactFlowProvider>
  );
};
