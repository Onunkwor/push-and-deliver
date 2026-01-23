"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  monoVerificationService,
  type VerificationResult,
} from "@/services/mono-verification.service";
import { ridersService } from "@/services/riders.service";
import { toast } from "sonner";
import { ShieldCheck, AlertCircle, CheckCircle } from "lucide-react";
import { useCurrentUser } from "@/contexts/UserContext";

interface MonoVerificationDialogProps {
  riderId: string;
  riderName?: string;
  currentVerification?: {
    ninVerified?: boolean;
    bvnVerified?: boolean;
    monoVerificationData?: {
      type: "NIN" | "BVN";
      verifiedAt?: Date;
      firstName?: string;
      lastName?: string;
    };
  };
  onVerificationComplete?: () => void;
}

export function MonoVerificationDialog({
  riderId,
  riderName,
  currentVerification,
  onVerificationComplete,
}: MonoVerificationDialogProps) {
  const { user } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [verificationType, setVerificationType] = useState<"NIN" | "BVN">(
    "NIN"
  );
  const [verificationNumber, setVerificationNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const isAlreadyVerified =
    currentVerification?.ninVerified || currentVerification?.bvnVerified;

  const handleVerify = async () => {
    if (!verificationNumber.trim()) {
      toast.error(`Please enter a ${verificationType}`);
      return;
    }

    if (verificationNumber.length !== 11) {
      toast.error(`${verificationType} must be exactly 11 digits`);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let verificationResult: VerificationResult;

      if (verificationType === "NIN") {
        verificationResult = await monoVerificationService.verifyNIN(
          verificationNumber
        );
      } else {
        verificationResult = await monoVerificationService.verifyBVN(
          verificationNumber
        );
      }

      setResult(verificationResult);

      if (verificationResult.success && verificationResult.data) {
        // Save verification data to rider document
        await ridersService.updateRider(riderId, {
          ninVerified: verificationType === "NIN",
          bvnVerified: verificationType === "BVN",
          monoVerificationData: {
            type: verificationType,
            verifiedAt: new Date(),
            verifiedBy: user?.id,
            firstName: verificationResult.data.firstName,
            lastName: verificationResult.data.lastName,
            middleName: verificationResult.data.middleName,
            dateOfBirth: verificationResult.data.dateOfBirth,
            phoneNumber: verificationResult.data.phoneNumber,
          },
        });

        toast.success(
          `${verificationType} verified and saved successfully`
        );

        if (onVerificationComplete) {
          onVerificationComplete();
        }
      } else {
        toast.error(verificationResult.message);
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setResult(null);
    setVerificationNumber("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isAlreadyVerified ? "outline" : "default"}>
          <ShieldCheck className="mr-2 h-4 w-4" />
          {isAlreadyVerified ? "View Verification" : "Verify Identity"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Identity Verification</DialogTitle>
          <DialogDescription>
            Verify {riderName || "rider"}'s identity using NIN or BVN via Mono
          </DialogDescription>
        </DialogHeader>

        {/* Show existing verification status if already verified */}
        {isAlreadyVerified && currentVerification?.monoVerificationData && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-700 dark:text-green-400">
              Already Verified
            </AlertTitle>
            <AlertDescription className="text-green-600 dark:text-green-300">
              <div className="mt-2 space-y-1">
                <p>
                  <strong>Type:</strong>{" "}
                  {currentVerification.monoVerificationData.type}
                </p>
                <p>
                  <strong>Name:</strong>{" "}
                  {currentVerification.monoVerificationData.firstName}{" "}
                  {currentVerification.monoVerificationData.lastName}
                </p>
                {currentVerification.monoVerificationData.verifiedAt && (
                  <p>
                    <strong>Verified At:</strong>{" "}
                    {new Date(
                      currentVerification.monoVerificationData.verifiedAt
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="verification-type">Verification Type</Label>
            <Select
              value={verificationType}
              onValueChange={(value) =>
                setVerificationType(value as "NIN" | "BVN")
              }
              disabled={loading}
            >
              <SelectTrigger id="verification-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NIN">
                  NIN (National Identification Number)
                </SelectItem>
                <SelectItem value="BVN">
                  BVN (Bank Verification Number)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="verification-number">{verificationType}</Label>
            <Input
              id="verification-number"
              type="text"
              maxLength={11}
              value={verificationNumber}
              onChange={(e) =>
                setVerificationNumber(e.target.value.replace(/\D/g, ""))
              }
              placeholder={`Enter 11-digit ${verificationType}`}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              {verificationNumber.length}/11 digits
            </p>
          </div>

          {/* Verification Result */}
          {result && (
            <Alert
              className={
                result.success
                  ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                  : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
              }
            >
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle
                className={
                  result.success
                    ? "text-green-700 dark:text-green-400"
                    : "text-red-700 dark:text-red-400"
                }
              >
                {result.success ? "Verification Successful" : "Verification Failed"}
              </AlertTitle>
              <AlertDescription
                className={
                  result.success
                    ? "text-green-600 dark:text-green-300"
                    : "text-red-600 dark:text-red-300"
                }
              >
                {result.success && result.data ? (
                  <div className="mt-2 space-y-1">
                    <p>
                      <strong>Name:</strong> {result.data.firstName}{" "}
                      {result.data.middleName} {result.data.lastName}
                    </p>
                    {result.data.dateOfBirth && (
                      <p>
                        <strong>DOB:</strong> {result.data.dateOfBirth}
                      </p>
                    )}
                    {result.data.phoneNumber && (
                      <p>
                        <strong>Phone:</strong> {result.data.phoneNumber}
                      </p>
                    )}
                    {result.data.gender && (
                      <p>
                        <strong>Gender:</strong> {result.data.gender}
                      </p>
                    )}
                  </div>
                ) : (
                  result.message
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {result?.success ? "Done" : "Cancel"}
          </Button>
          {!result?.success && (
            <Button onClick={handleVerify} disabled={loading}>
              {loading ? "Verifying..." : `Verify ${verificationType}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
