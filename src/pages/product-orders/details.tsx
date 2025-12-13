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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { productOrdersService } from "@/services/product-orders.service";
import type { ProductOrder, OrderItem } from "@/types";
import { OrderStatus } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  MapPin,
  Store,
  User,
  Bike,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductOrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<ProductOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrderDetails();
    }
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await productOrdersService.getOrderById(id!);
      if (!data) {
        toast.error("Order not found");
        navigate("/product-orders");
        return;
      }
      setOrder(data);
    } catch (error) {
      console.error("Error loading order details:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: number) => {
    switch (status) {
      case OrderStatus.Pending:
        return <Badge variant="secondary">Pending</Badge>;
      case OrderStatus.Assigned:
        return <Badge className="bg-blue-500">Assigned</Badge>;
      case OrderStatus.PickedUp:
        return <Badge className="bg-indigo-500">Picked Up</Badge>;
      case OrderStatus.OutForDelivery:
        return <Badge className="bg-orange-500">Out for Delivery</Badge>;
      case OrderStatus.Delivered:
        return <Badge className="bg-green-500">Delivered</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const statusSteps = [
    { label: "Pending", value: OrderStatus.Pending },
    { label: "Assigned", value: OrderStatus.Assigned },
    { label: "Picked Up", value: OrderStatus.PickedUp },
    { label: "Out for Delivery", value: OrderStatus.OutForDelivery },
    { label: "Delivered", value: OrderStatus.Delivered },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/product-orders")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Order #{order.orderId || order.id?.substring(0, 8)}
            </h1>
            {getStatusBadge(order.orderstatus)}
            {order.ispaid === false && (
              <Badge
                variant="outline"
                className="text-red-500 border-red-200 bg-red-50"
              >
                Unpaid
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            Created on{" "}
            {order.createdAt
              ? format(order.createdAt as Date, "MMMM d, yyyy 'at' h:mm a")
              : "N/A"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Order Items & Status */}
        <div className="md:col-span-2 space-y-6">
          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative flex justify-between">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -z-10 -translate-y-1/2" />
                {statusSteps.map((step, index) => {
                  const isCompleted = (order.orderstatus || 0) >= step.value;
                  const isCurrent = (order.orderstatus || 0) === step.value;

                  return (
                    <div
                      key={step.value}
                      className="flex flex-col items-center gap-2 bg-background px-2"
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                          isCompleted
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted bg-background text-muted-foreground"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          isCurrent
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>
                Order Items ({order.orderItems?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.orderItems?.map((item: OrderItem, idx: number) => (
                    <TableRow key={item.id || idx}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-12 w-12 rounded-md object-cover border"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                              <Store className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {item.category}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          {item.selectedColor && (
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">
                                Color:
                              </span>
                              <span className="font-medium">
                                {item.selectedColor}
                              </span>
                            </div>
                          )}
                          {item.selectedSize && (
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">
                                Size:
                              </span>
                              <span className="font-medium">
                                {item.selectedSize}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        ₦{(item.price || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">{item.qty}</TableCell>
                      <TableCell className="text-right font-medium">
                        ₦{(item.subtotal || 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Summary Rows */}
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-medium">
                      Subtotal
                    </TableCell>
                    <TableCell className="text-right">
                      ₦
                      {(
                        (order.total || 0) - (order.deliveryFee || 0)
                      ).toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-medium">
                      Delivery Fee
                    </TableCell>
                    <TableCell className="text-right">
                      ₦{(order.deliveryFee || 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-right font-bold text-lg"
                    >
                      Total
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      ₦{(order.total || 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Info Cards */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" /> Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">{order.customerName}</p>
                <p className="text-sm text-muted-foreground">
                  {order.customerPhoneNumber}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Delivery Address</p>
                    <p className="text-sm text-muted-foreground">
                      {order.deliveryaddress}
                    </p>
                    {order.lga && order.state && (
                      <Badge
                        variant="outline"
                        className="mt-1 text-xs font-normal"
                      >
                        {order.lga}, {order.state}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {order.otp && (
                <div className="bg-muted/50 p-3 rounded-md text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Delivery OTP
                  </p>
                  <p className="text-2xl font-mono font-bold tracking-widest">
                    {order.otp}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vendor Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Store className="h-4 w-4" /> Vendor Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">
                  {order.vendorName || "Unknown Vendor"}
                </p>
                {order.vendorAddress && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.vendorAddress}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    order.vendorPayoutProcessed ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {order.vendorPayoutProcessed
                    ? "Payout Processed"
                    : "Payout Pending"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Rider Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bike className="h-4 w-4" /> Rider Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.riderid ? (
                <>
                  <div>
                    <p className="text-sm font-medium">{order.ridername}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.riderphonenumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        order.riderPayoutProcessed ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {order.riderPayoutProcessed
                        ? "Payout Processed"
                        : "Payout Pending"}
                    </Badge>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg border border-dashed">
                  <p className="text-sm text-muted-foreground">
                    No rider assigned yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
