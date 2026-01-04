import ReactDOM from "react-dom/client";
import App from "./App";

import { ThemeProvider } from "@/components/theme-provider";

import "./index.css";
import { BrowserRouter } from "react-router";
import { PluginProvider } from "./components/plugins/plugin.provider";
import { ProjectsProvider } from "./components/projects/projects.provider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <ThemeProvider defaultTheme="dark" storageKey="-ui-mode">
      <PluginProvider>
        <ProjectsProvider>
          <App />
        </ProjectsProvider>
      </PluginProvider>
    </ThemeProvider>
  </BrowserRouter>,
);
