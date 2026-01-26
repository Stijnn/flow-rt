import { useReactFlow } from "@xyflow/react";
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
  useRef,
} from "react";

const CursorProviderContext = createContext<{ x: number; y: number, flowX: number, flowY: number, getFlowPosition: () => { x: number, y: number } } | null>(null);

export const CursorPositionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const reactFlow = useReactFlow();

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    setPosition({
      x: Math.floor(event.clientX - rect.left),
      y: Math.floor(event.clientY - rect.top),
    });
  };

  return (
    <CursorProviderContext.Provider value={{
        x: position.x,
        y: position.y,
        flowX: reactFlow.screenToFlowPosition(position).x,
        flowY: reactFlow.screenToFlowPosition(position).y,
        getFlowPosition: () => reactFlow.screenToFlowPosition(position)
    }}>
      <div className="h-full w-full" onMouseMove={handleMouseMove} ref={containerRef}>
        {children}
      </div>
    </CursorProviderContext.Provider>
  );
};

export const useCursorPosition = () => {
  const ctx = useContext(CursorProviderContext);

  if (!ctx) {
    throw Error;
  }

  return ctx;
};
