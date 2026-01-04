import { usePlugins } from "../plugins/plugin.provider";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "../ui/menubar";

export function NavBar() {
  const { showOverview } = usePlugins();

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
      </Menubar>
    </div>
  );
}
