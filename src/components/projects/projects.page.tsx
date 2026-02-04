import { EmptyProjects } from "./components/empty-projects.component";
import { ListProjects } from "./components/list-projects.component";
import { useProjects } from "./projects.provider";

export const ProjectsPage = () => {
  const { isEmpty } = useProjects();

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full">
      {isEmpty && <EmptyProjects />}
      {!isEmpty && <ListProjects />}
    </div>
  );
};
