import { Outlet } from "react-router";
import { NavBar } from "../navigation/nav-bar.component";
import { Label } from "../ui/label";
import { Toaster } from "../ui/sonner";
import { useTheme } from "../theme-provider";
import { DialogRenderer } from "../dialogs/dialog-renderer.component";
import { DialogProvider } from "../dialogs/dialog.provider";
import { RootProviders } from "./root.providers";
import { useEffect } from "react";

const Footer = () => {
  return (
    <div className="bg-accent">
      <div className="p-2">
        <Label>
          Workflows | Copyright (c) 2026 Stijnn. All Rights Reserved.
        </Label>
      </div>
    </div>
  );
};

const PageOutlet = () => {
  const { theme } = useTheme();

  return (
    <div className="h-dvh w-dvw flex flex-col overflow-hidden">
      <NavBar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
      <Footer />
      <Toaster expand={false} richColors position="top-right" theme={theme} />
    </div>
  );
};

export const RootLayout = () => {
  /* <div className="flex flex-1 flex-col h-dvh w-dvw overflow-hidden"></div> */
  return (
    <RootProviders>
      <DialogProvider>
        <DialogRenderer />
        <PageOutlet />
      </DialogProvider>
    </RootProviders>
  );
};
