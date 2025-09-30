import { Navigate, useNavigate } from "react-router";

import { toast } from "sonner";

import {
  MdOutlineInventory,
  MdOutlineHome,
  MdAddCircle,
  MdHistory,
} from "react-icons/md";
import { BiPurchaseTag } from "react-icons/bi";
import { FcSalesPerformance } from "react-icons/fc";
import { LuStore } from "react-icons/lu";
import { TbReport } from "react-icons/tb";
import { FaShippingFast } from "react-icons/fa";
import { LuLogs } from "react-icons/lu";
import { FaUsers } from "react-icons/fa6";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User2, ChevronUp } from "lucide-react";
import { Link, useLocation } from "react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { SidebarHeader, SidebarSeparator } from "./ui/sidebar";
import { useAppContext } from "../app-context";


export default function AppSidebar({ children, email }) {
  const {role} =  useAppContext()
  const allItems = [
    {
      title: "Home",
      url: "home",
      icon: MdOutlineHome,
    },
    {
      title: "Inventory",
      url: "inventory",
      icon: MdOutlineInventory,
    },
    {
      title: "Purchase",
      url: "purchase",
      icon: BiPurchaseTag,
      subItems: [
        { title: "New", url: "purchase/new", icon: MdAddCircle },
        { title: "History", url: "purchase/history", icon: MdHistory },
      ],
    },
    {
      title: "Sales",
      url: "sales",
      icon: FcSalesPerformance,
      subItems: [
        { title: "New", url: "sales/new", icon: MdAddCircle },
        { title: "History", url: "sales/history", icon: MdHistory },
      ],
    },
    {
      title: "Suppliers",
      url: "suppliers",
      icon: FaShippingFast,
    },
    {
      title: "Shops",
      url: "shops",
      icon: LuStore,
    },
    {
      title: "Reports",
      url: "reports",
      icon: TbReport,
    },
    {
      title: "Logs",
      url: "logs",
      icon: LuLogs,
      requires:"admin"
    },
    {
      title: "Users",
      url: "users",
      icon: FaUsers,
      requires:"admin"
    },
  ];
  const items = allItems.filter(
    (item) => !item.requires || item.requires === role
  );
  const navigate = useNavigate();
  const {name, refreshAuth} = useAppContext();
  async function handleSignOut() {
    try {
      const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;
      const res = await fetch(`${baseUrl}/auth/signout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (res.ok) {
        refreshAuth();
        <Navigate to="/"/>;
      }
    } catch (e) {
      console.log(e);
      toast.error("Failed to sign out.");
    }
  }
  const location = useLocation();
  return (
    <>
      <Sidebar collapsible="icon" variant="floating">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/">
                  <img src="../assets/react.svg" />
                  <span>Maa Tara Traders</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarSeparator className="m-0" />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === `/dashboard/${item.url}`}
                    >
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>

                    {item.subItems &&
                      item.subItems.map((item) => {
                        return (
                          <SidebarMenuSub key={item.title}>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={
                                  location.pathname === `/dashboard/${item.url}`
                                }
                              >
                                <Link to={item.url}>
                                  <item.icon />
                                  <span>{item.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        );
                      })}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem >
              <DropdownMenu >
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="cursor-pointer">
                    <User2 /> {name}
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="right"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem className="cursor-pointer" onClick={async() => await handleSignOut()}>
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
