import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { invoke } from "@tauri-apps/api/core";

type NativeFunctionsContextType = {
  getFunctions: () => Promise<string[]> | string[];
  invokeFunction: ({
    functionName,
    context,
  }: {
    functionName: string;
    context: any & {};
  }) => Promise<any> | any;
};

const NativeFunctionsContext = createContext<NativeFunctionsContextType | null>(
  null
);

export const NativeFunctionsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [cachedFunctions, setCachedFunctions] = useState<string[] | null>(null);

  const loadFunctions = async () => {
    const r = await invoke<string[]>("get_available_native_functions");
    setCachedFunctions(r);
    return r;
  };

  useEffect(() => {
    if (!cachedFunctions) {
      loadFunctions();
    }
  }, []);

  return (
    <NativeFunctionsContext
      value={{
        getFunctions: async () => {
          if (cachedFunctions) {
            return cachedFunctions;
          }
          return await loadFunctions();
        },
        invokeFunction: async ({ functionName, context }) => {
          return await invoke("invoke_native_fn", {
            invokeCtx: {
              name: functionName,
              context: context,
            },
          });
        },
      }}
    >
      {children}
    </NativeFunctionsContext>
  );
};

export const useNativeFunctions = () => {
  const ctx = useContext(NativeFunctionsContext);

  if (!ctx) {
    throw new Error(
      "useNativeFunctions can only be used within a NativeFunctionsProvider"
    );
  }

  return ctx;
};
