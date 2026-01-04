import { Route, Routes } from "react-router";
import { LayoutPage } from "./components/pages/layout.page";
import { ErrorPage } from "./components/pages/error.page";
import { PipelinePage } from "./components/pipelines/pipeline.page";
import { ProjectsPage } from "./components/projects/projects.page";
import { PluginInspectPage } from "./components/plugins/plugin-inspect.page";

function App() {
  return (
    <Routes>
      <Route element={<LayoutPage />}>
        <Route element={<ProjectsPage />} index path="/" />
        <Route element={<PluginInspectPage />} path="/plugins/inspect/:name" />
        <Route element={<PipelinePage />} path="/pipelines" />
        <Route element={<ErrorPage />} path="*" />
      </Route>
    </Routes>
  );
}

export default App;
