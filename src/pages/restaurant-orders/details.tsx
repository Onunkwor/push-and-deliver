import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { restaurantOrdersService } from "@/services/restaurant-orders.service";
import type { RestaurantOrder } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  IconArrowLeft,
  IconWallet,
  IconCash,
  IconUser,
  IconMapPin,
  IconNotes,
  IconShoppingCart,
  IconBuildingStore,
} from "@tabler/icons-react";

export default function RestaurantOrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<RestaurantOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await restaurantOrdersService.getOrderById(id!);
      setOrder(data);
    } catch (error) {
      console.error("Error loading order:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentStatusToggle = async (checked: boolean) => {
    if (!order?.id || order.paymentType === 0) return;

    try {
      setUpdatingPayment(true);
      await restaurantOrdersService.updatePaymentStatus(order.id, checked);
      setOrder({ ...order, ispaid: checked });
      toast.success(`Payment status updated to ${checked ? "Paid" : "Unpaid"}`);
    } catch (error) {
      toast.error("Failed to update payment status");
    } finally {
      setUpdatingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-muted-foreground">Order not found</p>
        <Button onClick={() => navigate("/restaurant-orders")}>
          <IconArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const canEditPayment = order.paymentType === 1 && !order.ispaid; // Only cash payments can be edited

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/restaurant-orders")}
        >
          <IconArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
          <p className="text-muted-foreground mt-1">Order ID: {order.id}</p>
        </div>
        <Badge
          variant={order.ispaid ? "default" : "destructive"}
          className="text-sm px-3 py-1"
        >
          {order.ispaid ? "Paid" : "Unpaid"}
        </Badge>
      </div>

      {/* Customer & Payment Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={order.customer?.imageUrl} />
                <AvatarFallback>
                  {order.customer?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{order.customer?.name || "N/A"}</p>
                <p className="text-sm text-muted-foreground">
                  {order.customer?.email || "N/A"}
                </p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Phone</span>
                <span className="text-sm font-medium">
                  {order.customer?.phoneNumber || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Payment Type
                </span>
                <div className="flex items-center gap-2">
                  {order.paymentType === 0 ? (
                    <>
                      <IconWallet className="h-4 w-4" />
                      <span className="text-sm font-medium">Wallet</span>
                    </>
                  ) : (
                    <>
                      <IconCash className="h-4 w-4" />
                      <span className="text-sm font-medium">Cash</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Order Date
                </span>
                <span className="text-sm font-medium">
                  {order.createdAt
                    ? format(new Date(order.createdAt as Date), "dd-MM-yyyy")
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Payment Status Toggle - Only for Cash when isPaid is false */}
            {canEditPayment && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="payment-status" className="text-sm">
                    Mark as Paid
                  </Label>
                  <Switch
                    id="payment-status"
                    checked={order.ispaid || false}
                    onCheckedChange={handlePaymentStatusToggle}
                    disabled={updatingPayment}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBuildingStore className="h-5 w-5" />
              Restaurant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={order.restaurant?.imageURL} />
                <AvatarFallback>
                  {order.restaurant?.name?.charAt(0) || "R"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{order.restaurant?.name || "N/A"}</p>
                <p className="text-sm text-muted-foreground">
                  {order.restaurant?.address || "N/A"}
                </p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Phone</span>
                <span className="text-sm font-medium">
                  {order.restaurant?.phoneNumber || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">OTP</span>
                <Badge variant="outline">{order.otp || "N/A"}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconMapPin className="h-5 w-5" />
            Delivery Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {order.deliveryLocation?.deliveryAddress || "No address provided"}
          </p>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span className="font-medium">
              ₦{(order.deliveryFee || 0).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <IconNotes className="h-4 w-4" />
              Note for Rider
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {order.noteForRider || `This user left no notes for the rider`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <IconNotes className="h-4 w-4" />
              Note for Restaurant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {order.noteForRestaurant ||
                `This user left no notes for ${order.restaurant?.name || "the restaurant"}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Menu Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconShoppingCart className="h-5 w-5" />
            Order Items
          </CardTitle>
          <CardDescription>
            {order.menuItems?.length || 0} item(s) ordered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.menuItems?.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Qty: {item.quantity}
                  </span>
                  <span className="font-medium">
                    ₦
                    {(
                      (item.price || 0) * (item.quantity || 1)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>
              ₦
              {(
                (order.totalAmount || 0) -
                (order.deliveryFee || 0) -
                (order.servicefee || 0)
              ).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Service Fee</span>
            <span>₦{(order.servicefee || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span>₦{(order.deliveryFee || 0).toLocaleString()}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between font-bold text-lg">
            <span>Total Amount</span>
            <span>₦{(order.totalAmount || 0).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
