import { Outlet } from "react-router-dom";
import Sidebar from "../shared/components/Sidebar";

export default function AppLayout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        <Outlet />
      </div>
    </div>
  );
}
