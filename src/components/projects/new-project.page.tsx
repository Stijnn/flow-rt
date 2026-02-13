import { Activity, useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Spinner } from "../ui/spinner";
import { invoke } from "@tauri-apps/api/core";
import { ProjectConfiguration } from "@/lib/models";
import { toast } from "sonner";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { useProjects } from "./projects.provider";
import { open } from "@tauri-apps/plugin-dialog";

export const NewProjectPage = () => {
  const nav = useNavigate();

  const { refreshProjects } = useProjects();
  const [projectName, setProjectName] = useState<string | null>(null);
  const [projectLocation, setProjectLocation] = useState<string | null>(null);
  const [initializeError, setInitializeError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const validateProjectName = (newName: string) => {
    const regex = /^[a-zA-Z0-9-]+$/;
    return regex.test(newName);
  };

  const pickProjectDirectory = async () => {
    const dir = await invoke<string>("validate_directory", {
      location: await invoke<string | null>("select_directory"),
    });
    setProjectLocation(dir);
  };

  const initializeProject = () => {
    setIsInitializing(true);

    if (!projectName) {
      setInitializeError("Invalid project name");
      setIsInitializing(false);
      return;
    }

    if (!projectLocation) {
      setInitializeError("Invalid location");
      setIsInitializing(false);
      return;
    }

    invoke<ProjectConfiguration>("create_project", {
      newProject: {
        name: projectName,
        location: `${projectLocation}/${projectName}`,
      },
    })
      .then((_) => {
        setInitializeError(null);
        refreshProjects();
      })
      .catch((e) => {
        toast.error(e);
        setInitializeError(e);
      })
      .finally(() => setIsInitializing(false));
  };

  return (
    <div className="flex-1 flex w-full h-full items-center justify-items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create a new project</CardTitle>
          <CardDescription>Enter details for the project</CardDescription>
        </CardHeader>
        <CardContent>
          <Activity mode={isInitializing ? "visible" : "hidden"}>
            <div className="flex flex-1 flex-row space-x-3 items-center">
              <Spinner id="indicatorInit" />
              <Label htmlFor="indicatorInit">Setting up project...</Label>
            </div>
          </Activity>
          <Activity mode={isInitializing ? "hidden" : "visible"}>
            <div className="flex flex-col space-y-5">
              <Activity mode={initializeError !== null ? "visible" : "hidden"}>
                <Alert variant={"destructive"}>
                  <AlertCircleIcon />
                  <AlertDescription>{initializeError}</AlertDescription>
                </Alert>
              </Activity>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                type="text"
                value={projectName ?? ""}
                placeholder="some-project-name"
                onChange={(newText) => {
                  const newName = newText.target.value;
                  if (newName === "") {
                    setProjectName(null);
                  }
                  if (validateProjectName(newName)) {
                    setProjectName(newName);
                  }
                }}
              />
              <Label htmlFor="projectDirectory">Location</Label>
              <div className="flex w-full items-center gap-2">
                <Input
                  required
                  id="projectDirectory"
                  type="text"
                  placeholder={projectLocation ?? `No location selected`}
                  disabled={true}
                />
                <Button variant={"outline"} onClick={async () => await pickProjectDirectory()}>
                  Select folder
                </Button>
              </div>
            </div>
          </Activity>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            variant={"outline"}
            onClick={() => initializeProject()}
            disabled={isInitializing}
            className="w-full"
          >
            Create
          </Button>
          <Button
            variant={"destructive"}
            disabled={isInitializing}
            onClick={() => nav("/")}
            className="w-full"
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
