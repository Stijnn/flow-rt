import ReactDOM from "react-dom/client";

import "./index.css";

import { router } from "./routes";
import { RouterProvider } from "react-router";
import { RootProviders } from "./components/pages/root.providers";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <RootProviders>
    <RouterProvider router={router} />
  </RootProviders>
);
