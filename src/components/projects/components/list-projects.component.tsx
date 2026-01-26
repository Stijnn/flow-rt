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

export const ListProjects = () => {
  const { projects, setProject } = useProjects();
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
      <div className="flex flex-col overflow-y-auto m-3">
        {projects.map((project) => {
          return (
            <Item variant={"muted"}>
              <ItemHeader>{project.projectName}</ItemHeader>
              <ItemContent>
                <ItemDescription>
                  Location: $HOME/.projects/{project.projectLocation}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  onClick={async () => {
                    await setProject(project);
                    nav("/editor");
                  }}
                  variant={"outline"}
                >
                  Open
                </Button>
              </ItemActions>
            </Item>
          );
        })}
      </div>
    </div>
  );
};
