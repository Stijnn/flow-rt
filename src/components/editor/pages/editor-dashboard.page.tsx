import { useCurrentProject } from "@/components/projects/current-project.provider"

export const EditorDashboardPage = () => {
    const { project } = useCurrentProject();

    return <>{project?.name}</>
}