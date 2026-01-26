import { ReactNode } from "react";
import { DialogProvider } from "../dialogs/dialog.provider";
import { PluginProvider } from "../plugins/plugin.provider";
import { ProjectsProvider } from "../projects/projects.provider";
import { SettingsProvider } from "../settings/settings.provider";
import { ThemeProvider } from "../theme-provider";

export const RootProviders = ({ children }: { children: ReactNode }) => {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <DialogProvider>
          <PluginProvider>
            <ProjectsProvider>{children}</ProjectsProvider>
          </PluginProvider>
        </DialogProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
};
