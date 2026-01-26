import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Plugin, usePlugins } from "../plugin.provider";
import { Badge } from "@/components/ui/badge";
import {
  EllipsisVertical,
  FileIcon,
  GitCommitVertical,
  GlassesIcon,
  HashIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { invoke } from "@tauri-apps/api/core";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { useNavigate } from "react-router";

const PluginItemCard = ({ plugin }: { plugin: Plugin }) => {
  const { requestReload } = usePlugins();
  const nav = useNavigate();

  return (
    <Item variant={"outline"}>
      <ItemContent>
        <ItemTitle className="flex flex-row items-center gap-4">
          <span>{plugin.name}</span>
          <Badge variant="destructive" className="flex items-center gap-1">
            <GitCommitVertical />
            Version: {plugin.version}
          </Badge>
        </ItemTitle>
        <ItemDescription className="flex flex-col text-balance space-y-2">
          <div>{plugin.description}</div>
          <Badge
            variant="outline"
            className="cursor-pointer bg-blue-500 hover:bg-blue-500/20 transition-colors"
            onClick={async () => {
              navigator.clipboard.writeText(plugin.location);
              toast.success("Location copied to clipboard");
            }}
          >
            <FileIcon />
            File: {plugin.location}
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer bg-purple-500 hover:bg-purple-500/20 transition-colors"
            onClick={async () => {
              navigator.clipboard.writeText(plugin.blake3_hash);
              toast.success("Hash copied to clipboard");
            }}
          >
            <HashIcon size={12} className="mr-1" />
            BLAKE3: {plugin.blake3_hash}
          </Badge>
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>Plugin</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                requestReload(plugin);
              }}
            >
              Reload
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={async () => {
                  navigator.clipboard.writeText(plugin.location);
                  toast.success("Location copied to clipboard");
                }}
              >
                Copy File Path
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  navigator.clipboard.writeText(plugin.blake3_hash);
                  toast.success("Hash copied to clipboard");
                }}
              >
                Copy BLAKE3 Hash
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await invoke("open_file_directory_external", {
                  dir: plugin.location,
                });
              }}
            >
              Open in file directory
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(_) => nav(`/plugins/inspect/${plugin.name}`)}
            >
              <GlassesIcon />
              Inspect
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ItemActions>
    </Item>
  );
};

const Overview = () => {
  const { plugins } = usePlugins();

  return (
    <div className="flex flex-col gap-y-2">
      {plugins.map((p) => (
        <PluginItemCard key={p.name} plugin={p} />
      ))}
    </div>
  );
};

const Community = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <h1>Maybe in the future</h1>
    </div>
  );
};

const Settings = () => {
  return (
    <div className="flex flex-col">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Module Discovery</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance"></AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Hot Reloading</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance"></AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Community / Third-Party Modules</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <div className="flex gap-3 flex-col">
              <div className="bg-muted p-3 rounded-md text-sm border-l-4 border-destructive">
                <strong>Use at your own risk:</strong> You assume all
                responsibility for any system instability or data loss resulting
                from third-party extensions. The core maintainers are not
                responsible for damages caused by unofficial code.
              </div>
              <div className="flex items-center gap-3">
                <Checkbox id="cb-community-enable" />
                <Label htmlFor="cb-community-enable">
                  Enable community modules
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="community-policy">
          <AccordionTrigger>Community Plugin Policy</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>
              This platform provides a bridge to community-created content.
              Because these plugins are developed independently,{" "}
              <strong>we cannot guarantee their security or stability.</strong>
            </p>
            <div className="bg-muted p-3 rounded-md text-sm border-l-4 border-destructive">
              <strong>Use at your own risk:</strong> You assume all
              responsibility for any system instability or data loss resulting
              from third-party extensions. The core maintainers are not
              responsible for damages caused by unofficial code.
            </div>
            <p className="text-xs text-muted-foreground italic">
              We recommend only installing plugins from trusted sources or
              verifying the BLAKE3 checksums provided by the developers.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="mit-policy">
          <AccordionTrigger>License & Liability</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance text-sm">
            <p>
              As per the <strong>MIT License</strong>, this software and its
              plugin architecture are provided "as is," without warranty of any
              kind, express or implied.
            </p>

            <blockquote className="border-l-2 border-muted-foreground/30 pl-4 italic text-muted-foreground">
              "In no event shall the authors or copyright holders be liable for
              any claim, damages or other liability... arising from, out of or
              in connection with the software or the use or other dealings in
              the software."
            </blockquote>

            <p>
              By enabling community plugins, you acknowledge that the core
              maintainers hold <strong>no responsibility</strong> for system
              failures, data corruption, or security issues caused by
              third-party code.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

enum PluginOverviewDialogTabs {
  OVERVIEW = "Overview",
  COMMUNITY = "Community",
  SETTINGS = "Settings",
}

export const PluginOverviewDialog = () => {
  const [activeTab, setActiveTab] = useState(PluginOverviewDialogTabs.OVERVIEW);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as PluginOverviewDialogTabs)}
    >
      <TabsList>
        {Object.values(PluginOverviewDialogTabs).map((label) => (
          <TabsTrigger key={label} value={label}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={PluginOverviewDialogTabs.OVERVIEW}>
        {activeTab === PluginOverviewDialogTabs.OVERVIEW && <Overview />}
      </TabsContent>

      <TabsContent value={PluginOverviewDialogTabs.COMMUNITY}>
        {activeTab === PluginOverviewDialogTabs.COMMUNITY && <Community />}
      </TabsContent>

      <TabsContent value={PluginOverviewDialogTabs.SETTINGS}>
        {activeTab === PluginOverviewDialogTabs.SETTINGS && <Settings />}
      </TabsContent>
    </Tabs>
  );
};
