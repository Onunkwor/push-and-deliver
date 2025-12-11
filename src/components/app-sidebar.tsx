import {
  IconCar,
  IconCash,
  IconCoin,
  IconDashboard,
  IconGift,
  IconGiftCard,
  IconHeadset,
  IconMotorbike,
  IconPlane,
  IconShoppingCart,
  IconTruckDelivery,
  IconUsers,
  IconUserShield,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
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
import { useCurrentUser } from "@/contexts/UserContext";
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
    {
      title: "Shipment Orders",
      url: "/shipment-orders",
      icon: IconPlane,
    },
    {
      title: "Ride Hailing",
      url: "/ride-hailing",
      icon: IconCar,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useCurrentUser();
  const adminType = user?.adminType || "regular";

  let navItems = [...data.navMain];

  if (adminType === "customercare") {
    const allowedTitles = [
      "Dashboard",
      "Users",
      "Riders",
      "Restaurants",
      "Support Tickets",
      "Restaurant Orders",
      "Shipment Orders",
      "Ride Hailing",
      "Coupons",
    ];
    navItems = navItems.filter((item) => allowedTitles.includes(item.title));
  } else if (adminType === "super") {
    // Add User Management for super admin
    navItems.splice(1, 0, {
      title: "User Management",
      url: "/admin/users",
      icon: IconUserShield,
    });
  }

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
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.username || "Admin",
            email: user?.email || "",
            avatar: user?.imageURL || "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
