import { Outlet } from "react-router-dom";
import Sidebar from "../shared/components/Sidebar";
import BottomNav from "../shared/components/BottomNav";
import MobileHeader from "../shared/components/MobileHeader";
import { useIsMobile } from "../shared/hooks/useIsMobile";

export default function AppLayout() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div style={{ minHeight: "100vh", paddingBottom: 64 }}>
        <MobileHeader />
        <Outlet />
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        <Outlet />
      </div>
    </div>
  );
}
