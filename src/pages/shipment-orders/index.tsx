import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { shipmentOrdersService } from "@/services/shipment-orders.service";
import type { ShipmentOrder } from "@/types";
import {
  IntlShipmentType,
  ShipmentCustomClearanceType,
  ShipmentOrderStatus,
} from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";
import { IconPackage, IconSearch, IconFilter } from "@tabler/icons-react";

export default function ShipmentOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ShipmentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [shipmentTypeFilter, setShipmentTypeFilter] = useState<string>("all");
  const [clearanceTypeFilter, setClearanceTypeFilter] = useState<string>("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await shipmentOrdersService.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load shipment orders");
    } finally {
      setLoading(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.shipmentID
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesShipmentType =
      shipmentTypeFilter === "all" ||
      order.shipmentType?.toString() === shipmentTypeFilter;
    const matchesClearanceType =
      clearanceTypeFilter === "all" ||
      (order.shipmentType === IntlShipmentType.customclearance &&
        order.clearanceType?.toString() === clearanceTypeFilter);

    return matchesSearch && matchesShipmentType && matchesClearanceType;
  });

  const getShipmentTypeLabel = (type?: number) => {
    if (type === IntlShipmentType.customclearance) return "Custom Clearance";
    if (type === IntlShipmentType.express) return "Express";
    return "N/A";
  };

  const getClearanceTypeLabel = (type?: number) => {
    if (type === ShipmentCustomClearanceType.seaconsignment)
      return "Sea Consignment";
    if (type === ShipmentCustomClearanceType.airconsignment)
      return "Air Consignment";
    return "N/A";
  };

  const getStatusLabel = (status?: number) => {
    switch (status) {
      case ShipmentOrderStatus.placed:
        return "Placed";
      case ShipmentOrderStatus.acceptedByRider:
        return "Accepted by Rider";
      case ShipmentOrderStatus.sentToHq:
        return "Sent to HQ";
      case ShipmentOrderStatus.onrouteToDestination:
        return "On Route to Destination";
      case ShipmentOrderStatus.deliveredToDestination:
        return "Delivered";
      case ShipmentOrderStatus.cancelled:
        return "Cancelled";
      case ShipmentOrderStatus.onRouteToPndHQ:
        return "On Route to PnD HQ";
      default:
        return "Unknown";
    }
  };

  const getStatusVariant = (
    status?: number
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case ShipmentOrderStatus.deliveredToDestination:
        return "default";
      case ShipmentOrderStatus.cancelled:
        return "destructive";
      case ShipmentOrderStatus.placed:
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleRowClick = (orderId: string) => {
    navigate(`/shipment-orders/${orderId}`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shipment Orders</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track all international shipment orders
        </p>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>All Shipments</CardTitle>
              <CardDescription>
                Click on any shipment to view full details
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative w-64">
                <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Shipment ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>

              {/* Shipment Type Filter */}
              <Select
                value={shipmentTypeFilter}
                onValueChange={setShipmentTypeFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <IconFilter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Shipment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="0">Custom Clearance</SelectItem>
                  <SelectItem value="1">Express</SelectItem>
                </SelectContent>
              </Select>

              {/* Clearance Type Filter (only for custom clearance) */}
              {shipmentTypeFilter === "0" && (
                <Select
                  value={clearanceTypeFilter}
                  onValueChange={setClearanceTypeFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <IconPackage className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Clearance Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clearance</SelectItem>
                    <SelectItem value="0">Sea Consignment</SelectItem>
                    <SelectItem value="1">Air Consignment</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shipment ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    {searchQuery ||
                    shipmentTypeFilter !== "all" ||
                    clearanceTypeFilter !== "all"
                      ? "No shipments found matching your filters"
                      : "No shipments found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(order.id!)}
                  >
                    <TableCell className="font-mono font-medium">
                      {order.shipmentID || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {order.customerName || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.customerPhonenumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">
                          {getShipmentTypeLabel(order.shipmentType)}
                        </p>
                        {order.shipmentType ===
                          IntlShipmentType.customclearance && (
                          <p className="text-xs text-muted-foreground">
                            {getClearanceTypeLabel(order.clearanceType)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.orderStatus)}>
                        {getStatusLabel(order.orderStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.ispaid ? "default" : "destructive"}>
                        {order.ispaid ? "Paid" : "Unpaid"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.createdAt
                        ? format(
                            new Date(order.createdAt as Date),
                            "dd-MM-yyyy"
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₦{(order.totalAmount || 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
