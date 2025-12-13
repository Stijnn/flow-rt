import { Outlet } from "react-router";
import useIsMobile from "../use-is-mobile";

export const LayoutPage = () => {
  const { isMobile } = useIsMobile();

  const MobileLayout = () => {
    return (
      <>
        <Outlet />
      </>
    );
  };

  const BigScreenLayout = () => {
    return (
      <>
        <Outlet />
      </>
    );
  };

  /* <div className="flex flex-1 flex-col h-dvh w-dvw overflow-hidden"></div> */
  return (
    <>
      {isMobile && <MobileLayout />}
      {!isMobile && <BigScreenLayout />}
    </>
  );
};
