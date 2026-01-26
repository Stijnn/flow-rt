import { EdgeProps, useReactFlow } from "@xyflow/react";
import { memo, useEffect, useState } from "react";
import { CustomBaseEdge } from "./custom-base.edge.component";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Trash2Icon } from "lucide-react";
import { EdgeStyleType } from "@/lib/graph.utils";

export const CustomEdge = memo((props: EdgeProps<CustomBaseEdge>) => {
  const [edgeStyleType, setEdgeStyleType] = useState<EdgeStyleType | undefined>(
    props.data?.styling?.edgeStyle ?? undefined
  );
  const reactFlow = useReactFlow();

  useEffect(() => {
    reactFlow.updateEdgeData(props.id, {
      styling: {
        edgeStyle: edgeStyleType
      },
    });
  }, [edgeStyleType]);

  return (
    <ContextMenu>
      <CustomBaseEdge {...props}>
        <ContextMenuTrigger>@edge.context.menu</ContextMenuTrigger>
        <ContextMenuContent className="overflow-hidden">
          <ContextMenuLabel>Style</ContextMenuLabel>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Select Style</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuRadioGroup
                value={edgeStyleType ?? "bezier"}
                onValueChange={(type) =>
                  setEdgeStyleType(type as EdgeStyleType)
                }
              >
                <ContextMenuRadioItem value={"straight"}>
                  Straight
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value={"bezier"}>
                  Bezier
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value={"simplebezier"}>
                  Simple Bezier
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value={"step"}>Step</ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuLabel>Actions</ContextMenuLabel>
          <ContextMenuItem
            variant="destructive"
            onClick={() =>
              reactFlow.setEdges(
                reactFlow.getEdges().filter((edge) => edge.id !== props.id)
              )
            }
          >
            <Trash2Icon />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </CustomBaseEdge>
    </ContextMenu>
  );
});

CustomEdge.displayName = "CustomEdge";
