"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ridersService } from "@/services/riders.service";
import type { Rider, Transaction } from "@/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, deleteObject } from "firebase/storage";
import { getStatusLabel, getStatusBadgeVariant } from "@/lib/status-utils";
import { VerificationStatus } from "@/types";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/contexts/UserContext";
import { ImageUploadCard } from "@/components/ImageUploadCard";
import { MonoVerificationDialog } from "@/components/MonoVerificationDialog";
import { CardDescription } from "@/components/ui/card";

const formatAmount = (amount: number) => {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getVerificationStatusLabel = (status: number | undefined) => {
  switch (status) {
    case VerificationStatus.verified:
      return "Verified";
    case VerificationStatus.unverified:
      return "Unverified";
    case VerificationStatus.blocked:
      return "Blocked";
    default:
      return "Unverified";
  }
};

const getVerificationBadgeVariant = (status: number | undefined) => {
  switch (status) {
    case VerificationStatus.verified:
      return "default";
    case VerificationStatus.blocked:
      return "destructive";
    default:
      return "secondary";
  }
};

export default function RiderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentAdmin } = useCurrentUser();
  const isSuperAdmin = currentAdmin?.adminType === "super";
  const canUploadDocuments =
    currentAdmin?.adminType === "super" ||
    currentAdmin?.adminType === "verifier";
  const [rider, setRider] = useState<Rider | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newVerificationStatus, setNewVerificationStatus] =
    useState<VerificationStatus>(VerificationStatus.unverified);
  const [newChassisNo, setNewChassisNo] = useState("");
  const [newEngineNo, setNewEngineNo] = useState("");
  const [newStatusReport, setNewStatusReport] = useState<"good" | "bad" | "fair" | "">("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadRiderData();
      loadRiderTransactions();
    }
  }, [id]);

  const loadRiderData = async () => {
    try {
      setLoading(true);
      const riderData = await ridersService.getRiderById(id!);

      if (!riderData) {
        toast.error("Rider not found");
        navigate("/riders");
        return;
      }

      setRider(riderData);
    } catch (error) {
      console.error("Error loading rider:", error);
      toast.error("Failed to load rider data");
    } finally {
      setLoading(false);
    }
  };

  const loadRiderTransactions = async () => {
    try {
      setLoadingTransactions(true);

      // Fetch from subcollection: Riders/{riderId}/Transactions
      const transactionsRef = collection(db, "Riders", id!, "Transactions");
      const q = query(transactionsRef, orderBy("time", "desc"));
      const querySnapshot = await getDocs(q);

      const txns = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().time?.toDate?.(),
      })) as Transaction[];

      setTransactions(txns);
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast.error("Failed to load rider transactions");
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleEditClick = () => {
    console.log(rider?.verificationStatus);
    setNewVerificationStatus(
      rider?.verificationStatus || VerificationStatus.unverified
    );
    setNewChassisNo(rider?.chassisNo || "");
    setNewEngineNo(rider?.engineNo || "");
    setNewStatusReport(rider?.statusReport || "");
    setEditDialogOpen(true);
  };

  const handleUpdateVerificationStatus = async () => {
    if (!rider?.id) return;

    try {
      setUpdating(true);
      const updateData: Partial<Rider> = {
        verificationStatus: newVerificationStatus,
      };

      // Include vehicle verification fields if provided
      if (newChassisNo) {
        updateData.chassisNo = newChassisNo;
      }
      if (newEngineNo) {
        updateData.engineNo = newEngineNo;
      }
      if (newStatusReport) {
        updateData.statusReport = newStatusReport;
      }

      await ridersService.updateRider(rider.id, updateData);
      toast.success("Verification details updated successfully");
      setEditDialogOpen(false);
      await loadRiderData();
    } catch (error) {
      console.error("Error updating verification details:", error);
      toast.error("Failed to update verification details");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!rider) {
    return null;
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/riders")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rider Details</h1>
          <p className="text-muted-foreground">
            Complete information for {rider.fullname || "rider"}
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{rider.fullname || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{rider.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone Number</p>
              <p className="font-medium">{rider.phonenumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rider ID</p>
              <p className="font-mono text-sm">{rider.id || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Home Address</p>
              <p className="font-medium">{rider.homeAddress || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Verification Status
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    getVerificationBadgeVariant(rider.verificationStatus) as any
                  }
                >
                  {getVerificationStatusLabel(rider.verificationStatus)}
                </Badge>
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditClick}
                      className="h-6 text-xs"
                    >
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Verification Status</DialogTitle>
                      <DialogDescription>
                        Update the verification status for{" "}
                        {rider.fullname || "this rider"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="status">Verification Status</Label>
                        <Select
                          value={String(newVerificationStatus)}
                          onValueChange={(value) =>
                            setNewVerificationStatus(
                              Number(value) as VerificationStatus
                            )
                          }
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value={String(VerificationStatus.verified)}
                            >
                              Verified
                            </SelectItem>
                            <SelectItem
                              value={String(VerificationStatus.unverified)}
                            >
                              Unverified
                            </SelectItem>
                            <SelectItem
                              value={String(VerificationStatus.blocked)}
                            >
                              Blocked
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="chassisNo">Chassis No</Label>
                        <Input
                          id="chassisNo"
                          value={newChassisNo}
                          onChange={(e) => setNewChassisNo(e.target.value)}
                          placeholder="Enter chassis number"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="engineNo">Engine No</Label>
                        <Input
                          id="engineNo"
                          value={newEngineNo}
                          onChange={(e) => setNewEngineNo(e.target.value)}
                          placeholder="Enter engine number"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="statusReport">Status Report</Label>
                        <Select
                          value={newStatusReport}
                          onValueChange={(value) =>
                            setNewStatusReport(value as "good" | "bad" | "fair")
                          }
                        >
                          <SelectTrigger id="statusReport">
                            <SelectValue placeholder="Select status report" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                            <SelectItem value="bad">Bad</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setEditDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateVerificationStatus}
                        disabled={updating}
                      >
                        {updating ? "Updating..." : "Update Status"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Online Status</p>
              <Badge variant={rider.onlineStatus ? "default" : "secondary"}>
                {rider.onlineStatus ? "Online" : "Offline"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ongoing Order</p>
              <Badge variant={rider.ongoingOrder ? "default" : "secondary"}>
                {rider.ongoingOrder ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Vehicle Type</p>
              <p className="font-medium capitalize">
                {rider.vehicleType || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Make</p>
              <p className="font-medium">{rider.vehicleMakename || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Model</p>
              <p className="font-medium">{rider.vehicleModelName || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Color</p>
              <p className="font-medium">{rider.vehicleColor || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plate Number</p>
              <p className="font-medium">{rider.plateNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chassis No</p>
              <p className="font-medium">{rider.chassisNo || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Engine No</p>
              <p className="font-medium">{rider.engineNo || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status Report</p>
              <Badge
                variant={
                  rider.statusReport === "good"
                    ? "default"
                    : rider.statusReport === "fair"
                      ? "secondary"
                      : rider.statusReport === "bad"
                        ? "destructive"
                        : "outline"
                }
              >
                {rider.statusReport
                  ? rider.statusReport.charAt(0).toUpperCase() +
                    rider.statusReport.slice(1)
                  : "N/A"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Images - For Super Admin and Verifiers */}
      {canUploadDocuments && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Verification Images</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <ImageUploadCard
              title="Car Picture"
              description="Upload a clear photo of the rider's vehicle"
              imageUrl={rider.carPictureUrl}
              riderId={rider.id!}
              imageType="car"
              onUploadComplete={async (url) => {
                try {
                  await ridersService.updateCarPicture(rider.id!, url);
                  setRider({ ...rider, carPictureUrl: url });
                  toast.success("Car picture uploaded successfully");
                } catch (error) {
                  console.error("Error saving car picture:", error);
                  toast.error("Failed to save car picture");
                }
              }}
              onDeleteComplete={async () => {
                try {
                  // Delete from Firebase Storage first
                  if (rider.carPictureUrl) {
                    const storageRef = ref(storage, rider.carPictureUrl);
                    await deleteObject(storageRef);
                  }

                  // Then update Firestore to set URL to null
                  await ridersService.deleteCarPicture(rider.id!);

                  // Update local state
                  setRider({ ...rider, carPictureUrl: null });
                  toast.success("Car picture deleted successfully");
                } catch (error) {
                  console.error("Error deleting car picture:", error);
                  toast.error("Failed to delete car picture");
                }
              }}
            />

            <ImageUploadCard
              title="Plate Number Picture"
              description="Upload a clear photo of the vehicle's plate number"
              imageUrl={rider.plateNumberPictureUrl}
              riderId={rider.id!}
              imageType="plateNumber"
              onUploadComplete={async (url) => {
                try {
                  await ridersService.updatePlateNumberPicture(rider.id!, url);
                  setRider({ ...rider, plateNumberPictureUrl: url });
                  toast.success("Plate number picture uploaded successfully");
                } catch (error) {
                  console.error("Error saving plate number picture:", error);
                  toast.error("Failed to save plate number picture");
                }
              }}
              onDeleteComplete={async () => {
                try {
                  // Delete from Firebase Storage first
                  if (rider.plateNumberPictureUrl) {
                    const storageRef = ref(
                      storage,
                      rider.plateNumberPictureUrl
                    );
                    await deleteObject(storageRef);
                  }

                  // Then update Firestore to set URL to null
                  await ridersService.deletePlateNumberPicture(rider.id!);

                  // Update local state
                  setRider({ ...rider, plateNumberPictureUrl: null });
                  toast.success("Plate number picture deleted successfully");
                } catch (error) {
                  console.error("Error deleting plate number picture:", error);
                  toast.error("Failed to delete plate number picture");
                }
              }}
            />

            <ImageUploadCard
              title="Driver's License"
              description="Upload a clear photo of the rider's driver's license"
              imageUrl={rider.driverLicensePictureUrl}
              riderId={rider.id!}
              imageType="driverLicense"
              onUploadComplete={async (url) => {
                try {
                  await ridersService.updateDriverLicensePicture(
                    rider.id!,
                    url
                  );
                  setRider({ ...rider, driverLicensePictureUrl: url });
                  toast.success("Driver's license uploaded successfully");
                } catch (error) {
                  console.error("Error saving driver's license:", error);
                  toast.error("Failed to save driver's license");
                }
              }}
              onDeleteComplete={async () => {
                try {
                  // Delete from Firebase Storage first
                  if (rider.driverLicensePictureUrl) {
                    const storageRef = ref(
                      storage,
                      rider.driverLicensePictureUrl
                    );
                    await deleteObject(storageRef);
                  }

                  // Then update Firestore to set URL to null
                  await ridersService.deleteDriverLicensePicture(rider.id!);

                  // Update local state
                  setRider({ ...rider, driverLicensePictureUrl: null });
                  toast.success("Driver's license deleted successfully");
                } catch (error) {
                  console.error("Error deleting driver's license:", error);
                  toast.error("Failed to delete driver's license");
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Identity Verification - For Super Admin and Verifiers */}
      {canUploadDocuments && (
        <Card>
          <CardHeader>
            <CardTitle>Identity Verification</CardTitle>
            <CardDescription>
              Verify rider identity using NIN or BVN via Mono
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                {rider.ninVerified || rider.bvnVerified ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-600">
                      {rider.monoVerificationData?.type} Verified
                    </Badge>
                    {rider.monoVerificationData && (
                      <span className="text-sm text-muted-foreground">
                        {rider.monoVerificationData.firstName}{" "}
                        {rider.monoVerificationData.lastName}
                      </span>
                    )}
                  </div>
                ) : (
                  <Badge variant="secondary">Not Verified</Badge>
                )}
              </div>
              <MonoVerificationDialog
                riderId={rider.id!}
                riderName={rider.fullname}
                currentVerification={{
                  ninVerified: rider.ninVerified,
                  bvnVerified: rider.bvnVerified,
                  monoVerificationData: rider.monoVerificationData,
                }}
                onVerificationComplete={loadRiderData}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallet & Bank Information */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet & Bank Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Wallet Balance</p>
              <p
                className="text-2xl font-bold"
                style={{ color: "hsl(150, 35%, 42%)" }}
              >
                ₦{formatAmount(rider.walletbalance || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bank Name</p>
              <p className="font-medium">{rider.bankInfo?.bankName || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Name</p>
              <p className="font-medium">{rider.bankInfo?.acctName || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Number</p>
              <p className="font-medium">
                {rider.bankInfo?.acctNumber || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTransactions ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No transactions found
            </p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Narration</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="text-sm">
                        {txn.time instanceof Date
                          ? txn.time.toLocaleString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            txn.transactionType === 0 ? "default" : "secondary"
                          }
                        >
                          {txn.transactionType === 0
                            ? "Credit"
                            : txn.transactionType === 1
                              ? "Debit"
                              : "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm max-w-xs">
                        {txn.narration || "N/A"}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "font-medium",
                          txn.transactionType === 0
                            ? "text-green-500"
                            : "text-red-500"
                        )}
                      >
                        ₦{formatAmount(txn.amount || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(txn.status) as any}
                        >
                          {getStatusLabel(txn.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {txn.trxref || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
