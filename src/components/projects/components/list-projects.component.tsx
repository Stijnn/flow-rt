import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
} from "@/components/ui/item";
import { PlusIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { useProjects } from "../projects.provider";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export const ListProjects = () => {
  const { projects, openProject } = useProjects();
  const nav = useNavigate();

  return (
    <div>
      <Item variant={"muted"} className="m-3">
        <ItemContent>
          <Button
            className="w-fit"
            variant={"outline"}
            onClick={() => nav("/projects/new")}
          >
            <PlusIcon />
            New Project
          </Button>
        </ItemContent>
      </Item>
      <ScrollArea className="flex-1 w-full">
        <div className="flex flex-col p-3 pt-0 space-y-3">
          {projects.map((project) => (
            <Item key={project.info.name} variant={"muted"}>
              <ItemHeader>{project.info.name}</ItemHeader>
              <ItemContent>
                <ItemDescription>Location: {project.location}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  variant={"outline"}
                  onClick={async () => openProject(project)}
                >
                  Open
                </Button>
              </ItemActions>
            </Item>
          ))}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};
