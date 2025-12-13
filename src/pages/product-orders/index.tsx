import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { productOrdersService } from "@/services/product-orders.service";
import type { ProductOrder } from "@/types";
import { OrderStatus } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Search } from "lucide-react";

export default function ProductOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ProductOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("all");

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, currentTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await productOrdersService.getAllOrders();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load product orders");
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by Tab (Status)
    if (currentTab !== "all") {
      const statusMap: Record<string, number> = {
        pending: OrderStatus.Pending,
        assigned: OrderStatus.Assigned,
        picked_up: OrderStatus.PickedUp,
        out_for_delivery: OrderStatus.OutForDelivery,
        delivered: OrderStatus.Delivered,
      };

      const targetStatus = statusMap[currentTab];
      if (targetStatus !== undefined) {
        filtered = filtered.filter(
          (order) => order.orderstatus === targetStatus
        );
      }
    }

    // Filter by Search
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderId?.toLowerCase().includes(lowercaseQuery) ||
          order.customerName?.toLowerCase().includes(lowercaseQuery) ||
          order.customerPhoneNumber?.includes(searchQuery)
      );
    }

    setFilteredOrders(filtered);
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

  const handleRowClick = (id: string) => {
    navigate(`/product-orders/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Orders</h1>
          <p className="text-muted-foreground">
            View and manage unpaid orders from E-commerce Merchants
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Order ID, Customer Name..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs
        defaultValue="all"
        onValueChange={setCurrentTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
          <TabsTrigger value="picked_up">Picked Up</TabsTrigger>
          <TabsTrigger value="out_for_delivery">Out for Delivery</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab} className="space-y-4">
          <Card>
            <CardHeader className="p-0" />
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No orders found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(order.id!)}
                      >
                        <TableCell className="font-medium">
                          {order.orderId || order.id?.substring(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {order.customerName || "N/A"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {order.customerPhoneNumber}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.orderItems?.length || 0} items
                        </TableCell>
                        <TableCell>
                          ₦{(order.total || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.orderstatus)}
                        </TableCell>
                        <TableCell
                          className="max-w-[200px] truncate"
                          title={order.deliveryaddress}
                        >
                          {order.deliveryaddress || "N/A"}
                        </TableCell>
                        <TableCell>
                          {order.createdAt
                            ? format(
                                order.createdAt as Date,
                                "MMM d, yyyy h:mm a"
                              )
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
