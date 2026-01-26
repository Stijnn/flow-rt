import { PlusIcon, X } from "lucide-react";
import { useDialogManager } from "../dialogs/dialog.provider";
import { usePlugins } from "../plugins/plugin.provider";
import { useCurrentProject } from "../projects/current-project.provider";
import { SettingsPage } from "../settings/settings.page";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubTrigger,
  MenubarTrigger,
  MenubarSubContent,
} from "../ui/menubar";
import { useNavigate } from "react-router";
import { NewGraphDialog } from "../editor/dialogs/new-graph-dialog/new-graph-dialog.component";
import { NewScriptDialog } from "../editor/dialogs/new-script-dialog.component";
import { useProjects } from "../projects/projects.provider";
import { PluginOverviewDialog } from "../plugins/components/plugin-overview-dialog.component";

const ProjectSpecificMenu = () => {
  const { clearProject } = useProjects();
  const dialogManager = useDialogManager();
  const nav = useNavigate();

  return (
    <MenubarMenu>
      <MenubarTrigger>Project</MenubarTrigger>
      <MenubarContent>
        <MenubarSub>
          <MenubarSubTrigger>Add</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem
              onClick={() =>
                dialogManager.addDialog(() => <NewGraphDialog />, {
                  variant: "normal",
                })
              }
            >
              Graph
            </MenubarItem>
            <MenubarItem
              onClick={() =>
                dialogManager.addDialog(() => <NewScriptDialog />, {
                  variant: "normal",
                })
              }
            >
              Script
            </MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSeparator />
        <MenubarItem
          variant="destructive"
          onClick={() => {
            clearProject();
            nav("/");
          }}
        >
          <X />
          Close Project
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
};

export function NavBar() {
  const { addDialog } = useDialogManager();
  const { selectedProject } = useProjects();

  return (
    <div className="p-0">
      <Menubar className="px-4 rounded-none border-x-0 border-t-0">
        {selectedProject && <ProjectSpecificMenu />}
        <MenubarMenu>
          <MenubarTrigger>Plugins</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={async () => {
              addDialog(() => <PluginOverviewDialog />);
            }}>
              Manage
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Settings</MenubarTrigger>
          <MenubarContent>
            <MenubarItem
              onClick={async () => {
                return addDialog(() => <SettingsPage />);
              }}
            >
              Manage
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
}
