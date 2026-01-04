import { EmptyProjects } from "./components/empty-projects.component";
import { useProjects } from "./projects.provider";

export const ProjectsPage = () => {
  const { projects, isEmpty } = useProjects();

  return (
    <div className="flex flex-col w-full h-full">
      {isEmpty && <EmptyProjects />}
      {!isEmpty && <h1>List Projects</h1>}
    </div>
  );
};
