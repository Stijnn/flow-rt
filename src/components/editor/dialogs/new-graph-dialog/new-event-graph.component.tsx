import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewEventGraphData } from "@/lib/graph.utils";
import { GraphEvent } from "@/lib/models";
import { Fn } from "@/lib/types";
import { hasDefinedProps } from "@/lib/utils";
import { useState, useEffect } from "react";

const mockEvents = [
    {
      eventName: "programStarted",
      data: {
        arguments: ["arg0", "arg1", "arg2", "arg3", "arg4"],
      },
    },
    {
      eventName: "programEnded",
      data: {
        exitCode: 1,
      },
    },
  ] as GraphEvent<{ arguments: string[] } | { exitCode: number }>[];
  
  export const NewEventGraph = ({
    value,
    onSettingsChanged,
  }: {
    value?: NewEventGraphData | Partial<NewEventGraphData>;
    onSettingsChanged: (value: NewEventGraphData) => Fn<void>;
  }) => {
    const [settings, setSettings] = useState<Partial<NewEventGraphData>>(
      value ?? {
        triggeredBy: undefined,
      }
    );
  
    useEffect(() => {
      if (hasDefinedProps<NewEventGraphData>(settings)) {
        onSettingsChanged(settings);
      }
    }, [settings]);
  
    const updateSettings = (
      settings: Partial<NewEventGraphData> | NewEventGraphData
    ) => {
      setSettings((prev) => {
        return {
          ...prev,
          ...settings,
        };
      });
    };
  
    return (
      <>
        <Label>Event Trigger:</Label>
        <Select
          value={settings.triggeredBy ?? ""}
          onValueChange={(newSelectedTrigger) => {
            updateSettings({
              triggeredBy:
                newSelectedTrigger === settings.triggeredBy
                  ? undefined
                  : newSelectedTrigger,
            });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an event" />
          </SelectTrigger>
          <SelectContent>
            {mockEvents.map((ev) => (
              <SelectItem value={ev.eventName}>{ev.eventName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </>
    );
  };