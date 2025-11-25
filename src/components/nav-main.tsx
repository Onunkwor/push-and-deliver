import { IconCirclePlusFilled, type Icon } from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { couponsService } from "@/services/coupons.service";
import { toast } from "sonner";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <SidebarMenuButton
                  tooltip="Create Coupon"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                >
                  <IconCirclePlusFilled />
                  <span>Create Coupon</span>
                </SidebarMenuButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Coupon</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to create a new coupon.
                  </DialogDescription>
                </DialogHeader>
                <CouponForm onSuccess={() => setIsDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              location.pathname === item.url ||
              location.pathname.startsWith(item.url + "/");
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  className={
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : ""
                  }
                  tooltip={item.title}
                  asChild
                >
                  <Link to={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function CouponForm({ onSuccess }: { onSuccess: () => void }) {
  const [percentageDiscount, setPercentageDiscount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateCoupon = async () => {
    if (!percentageDiscount) {
      toast.error("Please enter a percentage discount");
      return;
    }

    const discount = parseFloat(percentageDiscount);
    if (isNaN(discount) || discount <= 0 || discount > 100) {
      toast.error("Please enter a valid percentage (1-100)");
      return;
    }

    try {
      setLoading(true);
      await couponsService.createCoupon({
        percentageDiscount: discount,
        isActive: true,
      });
      toast.success("Coupon created successfully");
      setPercentageDiscount("");
      onSuccess();
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast.error("Failed to create coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="percentageDiscount">Percentage Discount (%)</Label>
        <Input
          id="percentageDiscount"
          type="number"
          placeholder="e.g. 50"
          value={percentageDiscount}
          onChange={(e) => setPercentageDiscount(e.target.value)}
        />
      </div>
      <Button onClick={handleCreateCoupon} disabled={loading}>
        {loading ? "Creating..." : "Create Coupon"}
      </Button>
    </div>
  );
}
