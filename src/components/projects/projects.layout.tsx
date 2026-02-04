import { Outlet } from "react-router";

export const ProjectsLayout = () => {
  return (
    <div className="flex flex-col w-full flex-1 min-h-0">
      <Outlet />
    </div>
  );
};
