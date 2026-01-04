import { invoke } from "@tauri-apps/api/core";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { PluginOverviewDialog } from "./components/plugin-overview-dialog.component";

export interface PluginFunctionDescriptor {
  function_name: string;
}

export interface Plugin {
  name: string;
  description: string;
  version: string;
  functions: any;
  location: string;
  blake3_hash: string;
}

type PluginProviderContext = {
  plugins: Plugin[];
  showOverview: () => Promise<void> | void;
  closeOverview: () => Promise<void> | void;
  requestReload: (plugin: Plugin) => Promise<void> | void;
  findPluginByName: (name: string) => Promise<Plugin> | Plugin;
} | null;

const PluginContext = createContext<PluginProviderContext>(null);

const PluginProviderManager = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => Promise<void> | void;
}) => {
  return (
    <PluginOverviewDialog
      key={"plugin-overview-dialog"}
      isOpen={isOpen}
      onRequestClose={async () => await onClose()}
    />
  );
};

export const PluginProvider = ({ children }: { children: ReactNode }) => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);

  const showOverview = async () => {
    setIsOverviewOpen((prev) => (prev ? prev : true));
  };

  const closeOverview = async () => {
    setIsOverviewOpen((prev) => (!prev ? prev : false));
  };

  const requestReload = async (plugin: Plugin) => {
    await invoke("request_plugin_reload", { pluginDesc: plugin });
    fetchPlugins();
  };

  const fetchPlugins = () => {
    invoke<Plugin[]>("fetch_plugins")
      .then((collection) => {
        setPlugins(collection);
        console.log(collection);
        toast.success("Loaded plugins");
      })
      .catch((e) => {
        toast.error(`Error loading plugins: ${e}`);
      })
      .finally(() => { });
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

  return (
    <PluginContext.Provider
      value={{
        plugins: plugins,
        showOverview,
        closeOverview,
        requestReload: async (p) => await requestReload(p),
        findPluginByName: async (name) =>
          plugins.filter((f) => f.name === name)[0] ?? undefined,
      }}
    >
      <PluginProviderManager
        isOpen={isOverviewOpen}
        onClose={async () => await closeOverview()}
      />
      {children}
    </PluginContext.Provider>
  );
};

export const usePlugins = () => {
  const ctx = useContext(PluginContext);

  if (!ctx) {
    throw new Error("usePlugins can only be used within a PluginProvider");
  }

  return ctx;
};
