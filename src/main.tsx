import ReactDOM from "react-dom/client";

import "./index.css";

import { router } from "./routes";
import { RouterProvider } from "react-router";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <RouterProvider router={router} />
);
