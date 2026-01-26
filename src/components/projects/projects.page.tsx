import { EmptyProjects } from "./components/empty-projects.component";
import { ListProjects } from "./components/list-projects.component";
import { useProjects } from "./projects.provider"

export const ProjectsPage = () => {
    const { isEmpty } = useProjects();
    
    return (
        <>
            {isEmpty && <EmptyProjects />}
            {!isEmpty && <ListProjects />}
        </>
    )
}