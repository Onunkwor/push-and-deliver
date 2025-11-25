// src/components/app-sidebar.tsx
import {
  IconDashboard,
  IconUsers,
  IconMotorbike,
  IconTruckDelivery,
  IconCoin,
  IconGift,
  IconCash,
  IconSettings,
  IconHelp,
  IconGiftCard,
  IconHeadset,
  IconShoppingCart,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Users",
      url: "/users",
      icon: IconUsers,
    },
    {
      title: "Riders",
      url: "/riders",
      icon: IconMotorbike,
    },
    {
      title: "Restaurants",
      url: "/vendors",
      icon: IconTruckDelivery,
    },
    {
      title: "Fees",
      url: "/fees",
      icon: IconCoin,
    },
    {
      title: "Referrals",
      url: "/referrals",
      icon: IconGift,
    },
    {
      title: "Withdrawals",
      url: "/withdrawals",
      icon: IconCash,
    },
    {
      title: "Coupons",
      url: "/coupons",
      icon: IconGiftCard,
    },
    {
      title: "Support Tickets",
      url: "/support-tickets",
      icon: IconHeadset,
    },
    {
      title: "Restaurant Orders",
      url: "/restaurant-orders",
      icon: IconShoppingCart,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Help & Support",
      url: "/help",
      icon: IconHelp,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/dashboard">
                <IconTruckDelivery className="!size-5" />
                <span className="text-base font-semibold">PushNDeliver</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.fullName || "Admin",
            email: user?.primaryEmailAddress?.emailAddress || "",
            avatar: user?.imageUrl || "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
