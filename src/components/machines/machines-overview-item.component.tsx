import { Machine } from "@/lib/models";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../ui/item";
import { Badge } from "../ui/badge";

export const MachineOverviewItem = ({ machine }: { machine: Machine }) => {
  return (
    <Item variant={"outline"}>
      <ItemMedia>
        <img src={machine.avatar} className="size-16" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{machine.name}</ItemTitle>
        <ItemDescription className="w-full">
          <Badge
            variant="secondary"
            className="bg-blue-500 text-white dark:bg-blue-600"
          >
            {machine.os}
          </Badge>
        </ItemDescription>
      </ItemContent>
    </Item>
  );
};
