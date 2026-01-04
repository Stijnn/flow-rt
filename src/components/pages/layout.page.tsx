import { Outlet } from "react-router";
import { useActiveMachine } from "../machines/active-machine.provider";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ActivityIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { NavBar } from "../navigation/nav-bar.component";
import { Label } from "../ui/label";
import { Toaster } from "../ui/sonner";

const ActiveMachineBanner = () => {
  const { activeMachine } = useActiveMachine();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (activeMachine) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [activeMachine]);

  const transitionClasses = `transition ease-linear duration-300 ${
    isVisible ? "opacity-100 max-h-40" : "opacity-0 max-h-0"
  } overflow-hidden`;

  if (!activeMachine) {
    return null;
  }

  return (
    <div className={transitionClasses}>
      <Alert
        variant={"default"}
        className="rounded-none bg-green-900 text-green-400 outline-green-600"
      >
        <ActivityIcon />
        <AlertTitle>Instance Active</AlertTitle>
        <AlertDescription className="text-green-300">
          {activeMachine.name} at {activeMachine.ip}
        </AlertDescription>
      </Alert>
    </div>
  );
};

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

export const LayoutPage = () => {
  /* <div className="flex flex-1 flex-col h-dvh w-dvw overflow-hidden"></div> */
  return (
    <div className="h-dvh w-dvw flex flex-col overflow-hidden">
      <NavBar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <Footer />
      <Toaster expand={false} richColors position="top-right" theme="dark" />
    </div>
  );
};
