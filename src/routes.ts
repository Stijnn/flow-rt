import { createHashRouter, redirect } from "react-router";
import { RootLayout } from "./components/pages/layout.page";
import { ProjectsLayout } from "./components/projects/projects.layout";
import { NewProjectPage } from "./components/projects/new-project.page";
import { ProjectsPage } from "./components/projects/projects.page";
import { ErrorPage } from "./components/pages/error.page";
import { PluginInspectPage } from "./components/plugins/plugin-inspect.page";
import { EditorLayout } from "./components/editor/editor.layout";
import { EditorDashboardPage } from "./components/editor/pages/editor-dashboard.page";
import { EditorGraphPage } from "./components/editor/pages/editor-graph.page";
import { EditorGraphsOverviewPage } from "./components/editor/pages/editor-graphs-overview.page";
import { EditorScriptsOverviewPage } from "./components/editor/pages/editor-scripts-overview.page";

export const router = createHashRouter([
    {
        path: "/",
        Component: RootLayout,
        ErrorBoundary: ErrorPage,
        children: [
            {
                index: true,
                loader: async () => {
                    return redirect("/projects");
                }
            },
            {
                path: "projects",
                Component: ProjectsLayout,
                children: [
                    {
                        index: true,
                        Component: ProjectsPage,
                    },
                    {
                        path: "new",
                        Component: NewProjectPage,
                    }
                ]
            },
            {
                path: "editor",
                Component: EditorLayout,
                children: [
                    {
                        index: true,
                        Component: EditorDashboardPage
                    },
                    {
                        path: "graphs",
                        Component: EditorGraphsOverviewPage
                    },
                    {
                        path: "graphs/:name",
                        Component: EditorGraphPage
                    },
                    {
                        path: "scripts",
                        Component: EditorScriptsOverviewPage
                    },
                    {
                        path: "scripts/:name",
                        Component: EditorScriptsOverviewPage
                    }
                ]
            },
            {
                path: "plugins/inspect/:name",
                loader: async ({ params }) => {
                    return { name: params.name };
                },
                Component: PluginInspectPage
            }
        ],
    }
]);