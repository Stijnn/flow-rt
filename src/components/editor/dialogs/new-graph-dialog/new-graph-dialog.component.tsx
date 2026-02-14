import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioIcon, SquareFunctionIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useCurrentProject } from "@/components/projects/current-project.provider";
import { Maybe } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { invoke } from "@tauri-apps/api/core";
import {
  AbstractGraphType,
  createGraph,
  CreateGraphPropsDataType,
  NewEventGraphData,
} from "@/lib/graph.utils";
import { hasDefinedProps, validateName } from "@/lib/utils";
import { NewEventGraph } from "./new-event-graph.component";
import { NewFunctionGraph } from "./new-function-graph.component";
import { toast } from "sonner";

type NewGraphProps = {
  graphType?: AbstractGraphType;
  graphName?: string;
  data?: CreateGraphPropsDataType;
};

export const NewGraphDialog = () => {
  const [newGraphProps, setNewGraphProps] = useState<NewGraphProps>({});
  const [error, setError] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const { addGraph } = useCurrentProject();

  const updateGraphProps = (
    updated: Partial<NewGraphProps> | NewGraphProps,
  ) => {
    setNewGraphProps((prev) => {
      return {
        ...prev,
        ...updated,
      };
    });
  };

  const onSubmit = () => {
    const obj = newGraphProps;

    setError(() => []);
    let hasError = false;

    if (!obj.graphName) {
      setError((prev) => [...prev, "No name was given"]);
      hasError = true;
    }

    if (!obj.graphType) {
      setError((prev) => [...prev, "Missing graph type"]);
      hasError = true;
    }

    if (!obj.data) {
      setError((prev) => [...prev, "Missing parameters"]);
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setIsCreating(true);

    if (hasDefinedProps(obj)) {
      invoke("create_graph", {
        parameters: createGraph({
          name: obj.graphName,
          graphType: obj.graphType,
          data: obj.data,
        }),
      })
        .catch((e) => {
          toast.error("Failed to create graph", {
            description: e,
          });
          setError((prev) => [...prev, e]);
        })
        .finally(() => {
          setIsCreating(false);
        });
    } else {
      throw Error(
        `hasDefinedProps(obj) got an object that with partial data. Potential guard rails invalid. ${JSON.stringify(obj)}`,
      );
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          New Graph <Badge>NEW</Badge>
        </DialogTitle>
        <DialogDescription>
          Create a new graph for your current project.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        {error.length > 0 && (
          <div className="grid gap-3">
            <Alert variant={"destructive"}>
              <AlertTitle>Errors:</AlertTitle>
              <AlertDescription>
                <ul>
                  {error.map((e) => (
                    <li>{e}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}
        <div className="grid gap-3">
          <Label htmlFor="graph-name-1">Name</Label>
          <Input
            id="graph-name-1"
            name="name"
            value={newGraphProps.graphName}
            placeholder="new-graph-name"
            onInput={(ev) => {
              const newName = ev.currentTarget.value;
              if (newName === "") {
                updateGraphProps({ graphName: undefined });
              } else if (validateName(newName)) {
                updateGraphProps({ graphName: newName });
              }
            }}
          />
        </div>
        <div className="grid gap-3">
          <Label>Type</Label>
          <Select
            value={newGraphProps.graphType ?? ""}
            onValueChange={(newGraphType: AbstractGraphType) =>
              updateGraphProps({ graphType: newGraphType })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a graph type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={"fnGraph"}>
                <SquareFunctionIcon />
                Function Graph
              </SelectItem>
              <SelectItem value={"eventGraph"}>
                <RadioIcon />
                Event Graph
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {newGraphProps.graphType && (
          <div className="grid gap-3">
            {newGraphProps.graphType === "fnGraph" && <NewFunctionGraph />}
            {newGraphProps.graphType === "eventGraph" && (
              <NewEventGraph
                value={newGraphProps.data as Maybe<NewEventGraphData>}
                onSettingsChanged={(v) => {
                  updateGraphProps({
                    data: v,
                  });
                }}
              />
            )}
          </div>
        )}
      </div>
      <DialogFooter>
        <DialogClose disabled={isCreating} asChild>
          <Button variant={"destructive"}>Cancel</Button>
        </DialogClose>
        <Button
          disabled={isCreating}
          onClick={() => onSubmit()}
          variant={"secondary"}
        >
          Create
        </Button>
      </DialogFooter>
    </>
  );
};
