import ReactDOM from "react-dom/client";
import App from "./App";

import { ThemeProvider } from "@/components/theme-provider";

import "./index.css";
import { BrowserRouter } from "react-router";
import { PluginProvider } from "./components/plugins/plugin.provider";
import { ProjectsProvider } from "./components/projects/projects.provider";
import {
  SettingsProvider,
  useSettings,
} from "./components/settings/settings.provider";

import { DialogProvider } from "./components/dialogs/dialog.provider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <SettingsProvider>
      <ThemeProvider>
        <DialogProvider>
          <PluginProvider>
            <ProjectsProvider>
              <App />
            </ProjectsProvider>
          </PluginProvider>
        </DialogProvider>
      </ThemeProvider>
    </SettingsProvider>
  </BrowserRouter>,
);
