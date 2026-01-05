import { invoke } from "@tauri-apps/api/core";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

type ThemeSetting = "dark" | "light" | "system";

export interface Settings {
  readonly version: number;
  themeMode?: ThemeSetting;
}

export type SettingsContextProps = {
  settings?: Settings;
  hasLoadedSettings: boolean;
  updateSettings: (
    newSettings: Partial<Settings> | Settings,
  ) => Promise<void> | void;
} | null;

const SettingsContext = createContext<SettingsContextProps>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings | undefined>(undefined);
  const [hasLoadedSettings, setHasLoadedSettings] = useState(false);

  useEffect(() => {
    invoke<Settings>("get_or_init_settings")
      .then((settings) => setSettings(settings))
      .catch((e) => toast.error(`Failed to load settings: ${e}`))
      .finally(() => setHasLoadedSettings(true));
  }, []);

  const updateSettings = async (newSettings: Partial<Settings> | Settings) => {
    setSettings((prev) => {
      return {
        ...prev,
        ...newSettings,
      } as Settings;
    });
  };

  useEffect(() => {
    if (!hasLoadedSettings || !settings) {
      return;
    }

    invoke<Settings>("sync_settings", { newSettings: settings })
      .then(() => {
        toast.success("Saved settings");
      })
      .catch((e) => {
        console.error(e);
        toast.error(`Failed to save settings.`);
      });
  }, [settings]);

  return (
    <SettingsContext.Provider
      value={{ settings: settings, hasLoadedSettings, updateSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);

  if (!ctx) {
    throw Error("useSettings can only be used within a SettingsProvider");
  }

  return ctx;
};
