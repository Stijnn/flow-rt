import { type ReactNode } from "react";
 
import {
  BaseEdge,
  Edge,
  EdgeLabelRenderer,
  type EdgeProps,
} from "@xyflow/react";
import { EdgeStyleType, PATH_GENERATORS } from "@/lib/graph.utils";

export type CustomBaseEdge = Edge<{
  styling?: {
    edgeStyle?: EdgeStyleType
  }
}>;

export function CustomBaseEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  children,
}: EdgeProps<CustomBaseEdge> & { children: ReactNode }) {
  const params = { sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition };
  const styleType = data?.styling?.edgeStyle ?? "bezier";

  const edgeGenerator = PATH_GENERATORS[styleType] ?? PATH_GENERATORS.bezier;
  const [edgePath, labelX, labelY] = edgeGenerator(params);
 
  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-auto absolute"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          {children}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}