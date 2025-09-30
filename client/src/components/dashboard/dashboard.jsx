import { useNavigate, Outlet, Navigate, useLocation } from "react-router";

import AppSidebar from "../sidebar";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar.jsx";
import { ToggleTheme } from "../toggle-theme.jsx";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Footer } from "../footer.jsx";
import { useAppContext } from "../../app-context.jsx";

export default function Dashboard({ children }) {
  const { status, loading, email } = useAppContext();
  if (loading) {
    return (
      <h1 className="w-[100vw] h-[100vh] flex justify-center items-center">
        <Spinner className="text-6xl" />
      </h1>
    );
  }
  if (status === "auth-failure") {
    return <Navigate to="/" replace />;
  }
  return (
    <>
      <div className="flex justify-center items-center min-h-screen">
        <SidebarProvider>
          <AppSidebar />
          <div className="p-2 flex flex-col flex-1">
            <div className="flex items-center justify-between">
              <SidebarTrigger />
              <ToggleTheme />
            </div>
            <main className=" flex flex-col items-center h-full justify-between">
              <Outlet />
              <Footer />
            </main>
          </div>
        </SidebarProvider>
      </div>
    </>
  );
}
