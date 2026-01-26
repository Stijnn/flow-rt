import { Outlet } from "react-router";

export const ProjectsLayout = () => {
  return (
    <div className="flex flex-col w-full h-full">
      <Outlet />
    </div>
  );
};
