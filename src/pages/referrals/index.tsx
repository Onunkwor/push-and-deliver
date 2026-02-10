"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { referralsService } from "@/services/referrals.service";
import { usersService } from "@/services/users.service";
import type { Referral, User } from "@/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ExportButton } from "@/components/ExportButton";
import { exportToCSV } from "@/lib/csv-export";

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [referralsData, usersData] = await Promise.all([
        referralsService.getAllReferrals(),
        usersService.getAllUsers(),
      ]);

      console.log("Referrals data loaded:", referralsData.length, "referrals");
      console.log("Users data loaded:", usersData.length, "users");

      setReferrals(referralsData);

      // Create a map of users by ID for quick lookup
      const usersMap = new Map<string, User>();
      usersData.forEach((user) => {
        if (user.id) {
          usersMap.set(user.id, user);
        }
      });
      setUsers(usersMap);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load referrals. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Group referrals by referrer
  const referrerStats = referrals.reduce(
    (acc, ref) => {
      const referrerId = ref.referrerUid;
      if (!referrerId) return acc;

      if (!acc[referrerId]) {
        const referrerUser = users.get(referrerId);
        acc[referrerId] = {
          referrerId,
          referrerName: referrerUser?.username || "Unknown",
          referralCount: 0,
          referredUsers: [],
          referredUserTypes: [],
        };
      }

      acc[referrerId].referralCount++;
      if (ref.referredUid) {
        acc[referrerId].referredUsers.push(ref.referredUid);
      }
      if (ref.referreduserType) {
        acc[referrerId].referredUserTypes.push(ref.referreduserType);
      }

      return acc;
    },
    {} as Record<
      string,
      {
        referrerId: string;
        referrerName: string;
        referralCount: number;
        referredUsers: string[];
        referredUserTypes: string[];
      }
    >,
  );

  const referrerList = Object.values(referrerStats);

  const filteredReferrers = referrerList.filter(
    (r) =>
      r.referrerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referrerId.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  console.log(filteredReferrers);

  const totalReferrers = referrerList.length;
  const totalReferralCount = referrals.length;
  const avgReferrals =
    totalReferrers > 0 ? (totalReferralCount / totalReferrers).toFixed(1) : "0";

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referrals</h1>
          <p className="text-muted-foreground">Track user referrals</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Referrals</h1>
        <p className="text-muted-foreground">
          Track user referrals and referral activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Referrers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReferrers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReferralCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Referrals per User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgReferrals}</div>
          </CardContent>
        </Card>
      </div>

      {/* Referrals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Details</CardTitle>
          <CardDescription>
            View all referrers and their referred users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Export */}
          <div className="mb-6 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <ExportButton
              onClick={() => {
                const exportData = filteredReferrers.map((r) => ({
                  referrerName: r.referrerName,
                  referrerId: r.referrerId,
                  referralCount: r.referralCount,
                  status: r.referralCount > 5 ? "Top Referrer" : "Active",
                }));
                exportToCSV(
                  exportData,
                  [
                    { header: "Referrer Name", accessor: "referrerName" },
                    { header: "Referrer ID", accessor: "referrerId" },
                    { header: "Referral Count", accessor: "referralCount" },
                    { header: "Status", accessor: "status" },
                  ],
                  "referrals_export",
                );
                toast.success("Referrals exported successfully");
              }}
              disabled={filteredReferrers.length === 0}
            />
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Referrer Name</TableHead>
                  <TableHead>Referrer UID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Rider</TableHead>
                  <TableHead>Total Referrer Count</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferrers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                    >
                      No referrals found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReferrers.map((referrer) => (
                    <TableRow
                      key={referrer.referrerId}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">
                        {referrer.referrerName}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {referrer.referrerId}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {(() => {
                            const userCount = referrer.referredUserTypes.filter(
                              (type) => type === "user",
                            ).length;
                            // Count entries without a type (old referrals) and add to user count
                            const unspecifiedCount =
                              referrer.referralCount -
                              referrer.referredUserTypes.length;
                            return userCount + unspecifiedCount;
                          })()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {
                            referrer.referredUserTypes.filter(
                              (type) => type === "rider",
                            ).length
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {referrer.referralCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">
                          {referrer.referralCount > 5
                            ? "Top Referrer"
                            : "Active"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
