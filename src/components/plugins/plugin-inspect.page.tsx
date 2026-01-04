import { useParams } from "react-router";
import { Plugin, usePlugins } from "./plugin.provider";
import { useEffect, useState } from "react";
import { Spinner } from "../ui/spinner";
import { Item, ItemContent, ItemDescription, ItemHeader } from "../ui/item";
import { Badge } from "../ui/badge";
import { Code2Icon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const InspectPlugin = ({ plugin }: { plugin: Plugin }) => {
  return (
    <div className="p-2 gap-2 flex flex-col">
      <Item variant="muted">
        <ItemHeader>{plugin.name}</ItemHeader>
      </Item>
      <div className="flex flex-col gap-2">
        {[...Object.keys(plugin.functions)].map((v, i) => {
          const desc = Object.values(plugin.functions)[i];
          return (
            <Item variant="outline">
              <ItemContent>
                <ItemDescription>
                  <Badge className="bg-red-500 text-white">
                    <Code2Icon />
                    Extern: {v}
                  </Badge>
                </ItemDescription>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Schema</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                      <p>{JSON.stringify(desc, null, 2)}</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </ItemContent>
            </Item>
          );
        })}
      </div>
    </div>
  );
};

export const PluginInspectPage = () => {
  const { name } = useParams();
  const { findPluginByName } = usePlugins();

  const [plugin, setPlugin] = useState<Plugin | null>(null);
  const [hasLoadedPlugin, setHasLoadedPlugin] = useState(false);
  const [couldNotFindPlugin, setCouldNotFindPlugin] = useState(false);

  const loadPlugin = async () => {
    const plugin = await findPluginByName(name!);
    if (!plugin) throw Error("Could not find plugin");
    setPlugin(plugin);
  };

  useEffect(() => {
    if (!name) {
      setCouldNotFindPlugin(true);
      setHasLoadedPlugin(true);
      return;
    }

    loadPlugin()
      .then(() => {
        setCouldNotFindPlugin(false);
      })
      .catch(() => {
        setCouldNotFindPlugin(true);
      })
      .finally(() => {
        setHasLoadedPlugin(true);
      });
  }, []);

  return (
    <>
      {!hasLoadedPlugin && <Spinner />}
      {hasLoadedPlugin && couldNotFindPlugin && <h1>Error finding plugin</h1>}
      {plugin && <InspectPlugin plugin={plugin} />}
    </>
  );
};
