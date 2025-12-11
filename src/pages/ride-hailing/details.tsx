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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { rideHailingService } from "@/services/ridehailing.service";
import type { RideHaulingOrder } from "@/types";
import { RideHaulingType, RideHaulingStatus } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  IconArrowLeft,
  IconWallet,
  IconCash,
  IconUser,
  IconMapPin,
  IconCar,
  IconBuilding,
  IconClock,
  IconRoute,
  IconAlertTriangle,
  IconCircleCheck,
  IconTruck,
  IconClockHour4,
} from "@tabler/icons-react";
import { useCurrentUser } from "@/contexts/UserContext";

export default function RideHailingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const isViewOnly = user?.adminType === "customercare";

  const [order, setOrder] = useState<RideHaulingOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await rideHailingService.getOrderById(id!);
      setOrder(data);
    } catch (error) {
      console.error("Error loading order:", error);
      toast.error("Failed to load ride details");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentStatusToggle = async (checked: boolean) => {
    if (!order?.id || order.paymentType === 0) return;

    try {
      setUpdatingPayment(true);
      await rideHailingService.updatePaymentStatus(order.id, checked);
      setOrder({ ...order, ispaid: checked });
      toast.success(`Payment status updated to ${checked ? "Paid" : "Unpaid"}`);
    } catch (error) {
      toast.error("Failed to update payment status");
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order?.id) return;

    try {
      setUpdatingStatus(true);
      await rideHailingService.updateOrderStatus(order.id, parseInt(newStatus));
      setOrder({ ...order, orderStatus: parseInt(newStatus) });
      toast.success("Order status updated successfully");
    } catch (error) {
      toast.error("Failed to update order status");
    } finally {
      setUpdatingStatus(false);
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
        <p className="text-muted-foreground">Ride not found</p>
        <Button onClick={() => navigate("/ride-hailing")}>
          <IconArrowLeft className="mr-2 h-4 w-4" />
          Back to Rides
        </Button>
      </div>
    );
  }

  const canEditPayment =
    order.paymentType === 1 && !order.ispaid && !isViewOnly;
  const isCourier = order.rideType === RideHaulingType.courier;
  const hasRider = !!order.riderID;

  const getRideTypeLabel = () => {
    switch (order.rideType) {
      case RideHaulingType.regular:
        return "Regular";
      case RideHaulingType.discountexpress:
        return "Discount Express";
      case RideHaulingType.express:
        return "Express";
      case RideHaulingType.premier:
        return "Premier";
      case RideHaulingType.courier:
        return "Courier";
      default:
        return "Unknown";
    }
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return "N/A";
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/ride-hailing")}
        >
          <IconArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Ride Details</h1>
          <p className="text-muted-foreground mt-1">
            Order ID: <span className="font-mono">{order.id}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={order.ispaid ? "default" : "destructive"}
            className="text-sm px-3 py-1"
          >
            {order.ispaid ? "Paid" : "Unpaid"}
          </Badge>
          <Badge variant="outline" className="text-sm px-3 py-1">
            {getRideTypeLabel()}
          </Badge>
        </div>
      </div>

      {/* Colored Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Status Card - Editable for Courier, Static for Others */}
        {(() => {
          // Helper function to get status display info
          const getStatusInfo = (status: number) => {
            switch (status) {
              case RideHaulingStatus.requested:
                return {
                  label: "Requested",
                  icon: IconClockHour4,
                  colorClass:
                    "from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800",
                  textClass: "text-amber-900 dark:text-amber-100",
                  badgeVariant: "outline" as const,
                };
              case RideHaulingStatus.accepted:
                return {
                  label: "Accepted",
                  icon: IconCircleCheck,
                  colorClass:
                    "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800",
                  textClass: "text-blue-900 dark:text-blue-100",
                  badgeVariant: "default" as const,
                };
              case RideHaulingStatus.onroute:
                return {
                  label: "On Route",
                  icon: IconTruck,
                  colorClass:
                    "from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800",
                  textClass: "text-indigo-900 dark:text-indigo-100",
                  badgeVariant: "default" as const,
                };
              case RideHaulingStatus.completed:
                return {
                  label: "Completed",
                  icon: IconCircleCheck,
                  colorClass:
                    "from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800",
                  textClass: "text-green-900 dark:text-green-100",
                  badgeVariant: "default" as const,
                };
              case RideHaulingStatus.cancelled:
                return {
                  label: "Cancelled",
                  icon: IconAlertTriangle,
                  colorClass:
                    "from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800",
                  textClass: "text-red-900 dark:text-red-100",
                  badgeVariant: "destructive" as const,
                };
              case RideHaulingStatus.expired:
                return {
                  label: "Expired",
                  icon: IconAlertTriangle,
                  colorClass:
                    "from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 border-gray-200 dark:border-gray-800",
                  textClass: "text-gray-900 dark:text-gray-100",
                  badgeVariant: "outline" as const,
                };
              default:
                return {
                  label: "Unknown",
                  icon: IconAlertTriangle,
                  colorClass:
                    "from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 border-gray-200 dark:border-gray-800",
                  textClass: "text-gray-900 dark:text-gray-100",
                  badgeVariant: "secondary" as const,
                };
            }
          };

          // Show editable dropdown for courier orders (not cancelled)
          if (isCourier && order.orderStatus !== RideHaulingStatus.cancelled) {
            return (
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Order Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={order.orderStatus?.toString()}
                    onValueChange={handleStatusChange}
                    disabled={updatingStatus || isViewOnly}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value={RideHaulingStatus.completed.toString()}
                      >
                        Completed
                      </SelectItem>
                      <SelectItem
                        value={RideHaulingStatus.cancelled.toString()}
                      >
                        Cancelled
                      </SelectItem>
                      <SelectItem
                        value={RideHaulingStatus.courierdeliverdtopnd.toString()}
                      >
                        Delivered to PnD
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            );
          }

          // Show static status card for all other cases
          const statusInfo = getStatusInfo(order.orderStatus || 0);
          const StatusIcon = statusInfo.icon;

          return (
            <Card className={`bg-gradient-to-br ${statusInfo.colorClass}`}>
              <CardHeader className="pb-3">
                <CardTitle
                  className={`text-sm font-medium ${statusInfo.textClass}`}
                >
                  Ride Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <StatusIcon className={`h-5 w-5 ${statusInfo.textClass}`} />
                  <Badge
                    variant={statusInfo.badgeVariant}
                    className="text-sm font-semibold"
                  >
                    {statusInfo.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
              Payment Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-green-900 dark:text-green-100">
              {order.paymentType === 0 ? (
                <>
                  <IconWallet className="h-5 w-5" />
                  <span className="font-semibold">Wallet</span>
                </>
              ) : (
                <>
                  <IconCash className="h-5 w-5" />
                  <span className="font-semibold">Cash</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              ₦{(order.totalAmount || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cancellation Reason Card - Only shown when cancelled */}
      {order.orderStatus === RideHaulingStatus.cancelled && (
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-300 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
              <IconAlertTriangle className="h-5 w-5" />
              Cancellation Details
            </CardTitle>
            <CardDescription className="text-red-800 dark:text-red-200">
              This ride was cancelled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-red-900 dark:text-red-100">
                  Reason
                </span>
                <p className="text-sm text-red-800 dark:text-red-200 bg-white/50 dark:bg-black/20 p-3 rounded-md">
                  {order.cancellationReason || "No reason provided"}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {order.canclledBy && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-red-800 dark:text-red-300">
                      Cancelled By
                    </span>
                    <span className="text-sm font-medium text-red-900 dark:text-red-100">
                      {order.canclledBy}
                    </span>
                  </div>
                )}
                {order.cancelledAt && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-red-800 dark:text-red-300">
                      Cancelled At
                    </span>
                    <span className="text-sm font-medium text-red-900 dark:text-red-100">
                      {format(
                        new Date(order.cancelledAt as Date),
                        "dd-MM-yyyy HH:mm"
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Info & Trip Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="text-sm font-medium">
                  {order.customerName || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Phone</span>
                <span className="text-sm font-medium">
                  {order.customerPhonenumber || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">OTP</span>
                <Badge variant="outline">{order.otp || "N/A"}</Badge>
              </div>
            </div>

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
              <IconRoute className="h-5 w-5" />
              Trip Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <IconRoute className="h-4 w-4" />
                Distance
              </span>
              <span className="text-sm font-medium">
                {formatDistance(order.estimatedDistanceMeters)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <IconClock className="h-4 w-4" />
                Duration
              </span>
              <span className="text-sm font-medium">
                {formatDuration(order.estimatedDurationSeconds)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm font-medium">
                {order.createdAt
                  ? format(
                      new Date(order.createdAt as Date),
                      "dd-MM-yyyy HH:mm"
                    )
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Locations */}
      <div
        className={`grid gap-4 ${isCourier ? "md:grid-cols-3" : "md:grid-cols-2"}`}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <IconMapPin className="h-4 w-4" />
              Pickup Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {order.startoffAddress || "No address provided"}
            </p>
          </CardContent>
        </Card>

        {isCourier && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconBuilding className="h-4 w-4" />
                PnD Office
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {order.pndofficeaddress || "No address provided"}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <IconMapPin className="h-4 w-4" />
              Drop-off Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {order.dropoffAddress || "No address provided"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rider Information */}
      {hasRider && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCar className="h-5 w-5" />
              Rider Information
            </CardTitle>
            <CardDescription>Assigned driver details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Rider Profile Section */}
              <div className="flex flex-col items-center gap-3 md:border-r md:pr-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={order.riderImageURL} />
                  <AvatarFallback className="text-2xl">
                    {order.riderName?.charAt(0) || "R"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="font-semibold text-lg">
                    {order.riderName || "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.riderPhoneNumber || "N/A"}
                  </p>
                </div>
              </div>

              {/* Vehicle Details Section */}
              <div className="flex-1">
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                  Vehicle Details
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Model</span>
                    <span className="text-sm font-medium">
                      {order.riderCarModel || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Plate Number
                    </span>
                    <Badge variant="outline" className="w-fit font-mono">
                      {order.riderCarPlateNumber || "N/A"}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Color</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full border border-gray-300"
                        style={{
                          backgroundColor:
                            order.riderCarColor?.toLowerCase() || "#gray",
                        }}
                      />
                      <span className="text-sm font-medium">
                        {order.riderCarColor || "N/A"}
                      </span>
                    </div>
                  </div>
                  {order.riderCarName && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">
                        Car Name
                      </span>
                      <span className="text-sm font-medium">
                        {order.riderCarName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!hasRider && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
            <p>No rider assigned yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
