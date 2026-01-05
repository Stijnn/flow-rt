import { useDialogManager } from "../dialogs/dialog.provider";
import { usePlugins } from "../plugins/plugin.provider";
import { SettingsPage } from "../settings/settings.page";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "../ui/menubar";

export function NavBar() {
  const { showOverview } = usePlugins();
  const { addDialog } = useDialogManager();

  return (
    <div className="p-0">
      <Menubar className="px-4 rounded-none border-x-0 border-t-0">
        <MenubarMenu>
          <MenubarTrigger>Plugins</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={async () => await showOverview()}>
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
