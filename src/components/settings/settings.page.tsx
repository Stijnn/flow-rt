import { Laptop2Icon, MoonIcon, SunIcon } from "lucide-react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "../ui/item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useSettings } from "./settings.provider";

const ThemeSettingsTab = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <div>
      <Item variant={"muted"}>
        <ItemContent>
          <ItemTitle>Theme</ItemTitle>
          <ItemDescription>
            Switch between dark, light and system mode. System will adapt to
            your system settings.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Select
            value={settings?.themeMode}
            onValueChange={(v) => {
              if (v !== "light" && v !== "dark" && v !== "system") {
                return;
              }

              updateSettings({
                themeMode: v,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a theme mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">
                <SunIcon />
                Light
              </SelectItem>
              <SelectItem value="dark">
                <MoonIcon />
                Dark
              </SelectItem>
              <SelectItem value="system">
                <Laptop2Icon />
                System
              </SelectItem>
            </SelectContent>
          </Select>
        </ItemActions>
      </Item>
    </div>
  );
};

export const SettingsPage = () => {
  return (
    <div>
      <Tabs defaultValue="settings-theme">
        <TabsList>
          <TabsTrigger value="settings-theme">Theme</TabsTrigger>
        </TabsList>
        <TabsContent value="settings-theme">
          <ThemeSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
