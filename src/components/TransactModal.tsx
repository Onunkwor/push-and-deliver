import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usersService } from "@/services/users.service";
import { ridersService } from "@/services/riders.service";
import { transactionService } from "@/services/transaction.service";
import type { User, Rider } from "@/types";
import { toast } from "sonner";
import { useCurrentUser } from "@/contexts/UserContext";

interface TransactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactModal({ open, onOpenChange }: TransactModalProps) {
  const { user: currentAdmin, refetchUser } = useCurrentUser();
  const [transactionMode, setTransactionMode] = useState<"credit" | "debit">("credit");
  const [recipientType, setRecipientType] = useState<"user" | "rider">("user");
  const [users, setUsers] = useState<User[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [narration, setNarration] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  useEffect(() => {
    // Auto-fill narration for riders
    if (recipientType === "rider" && !narration) {
      setNarration("Requested a rider");
    } else if (recipientType === "user" && narration === "Requested a rider") {
      setNarration("");
    }
  }, [recipientType]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [usersData, ridersData] = await Promise.all([
        usersService.getAllUsers(),
        ridersService.getAllRiders(),
      ]);
      setUsers(usersData);
      setRiders(ridersData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load users and riders");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedRecipientId) {
      toast.error("Please select a recipient");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Only check admin balance for credit (sending money)
    if (transactionMode === "credit") {
      if (
        !currentAdmin?.walletbalance ||
        currentAdmin.walletbalance < amountNum
      ) {
        toast.error("Insufficient wallet balance");
        return;
      }
    }

    if (!narration.trim()) {
      toast.error("Please enter a narration");
      return;
    }

    try {
      setLoading(true);

      if (transactionMode === "credit") {
        await transactionService.transferMoney({
          senderId: currentAdmin.id!,
          senderType: "user", // Super admin uses Users collection
          recipientId: selectedRecipientId,
          recipientType: recipientType,
          amount: amountNum,
          narration: narration.trim(),
        });
      } else {
        await transactionService.debitMoney({
          targetId: selectedRecipientId,
          targetType: recipientType,
          amount: amountNum,
          narration: narration.trim(),
        });
      }

      toast.success(`${transactionMode === "credit" ? "Credit" : "Debit"} transaction completed successfully`);

      // Refetch user data to update wallet balance
      await refetchUser();

      onOpenChange(false);

      // Reset form
      setTransactionMode("credit");
      setSelectedRecipientId("");
      setAmount("");
      setNarration("");
    } catch (error: any) {
      console.error("Transaction error:", error);
      toast.error(error.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  const adminBalance = currentAdmin?.walletbalance || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {transactionMode === "credit" ? "Send Money (Credit)" : "Take Money (Debit)"}
          </DialogTitle>
          <DialogDescription>
            {transactionMode === "credit"
              ? "Transfer funds from your wallet to a user or rider"
              : "Debit funds from a user or rider's wallet"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Transaction Mode Selection */}
          <Tabs
            value={transactionMode}
            onValueChange={(value) =>
              setTransactionMode(value as "credit" | "debit")
            }
            className="mb-4"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="credit">Credit (Send)</TabsTrigger>
              <TabsTrigger value="debit">Debit (Take)</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Recipient Type Selection */}
          <Tabs
            value={recipientType}
            onValueChange={(value) =>
              setRecipientType(value as "user" | "rider")
            }
            className="mb-4"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">User</TabsTrigger>
              <TabsTrigger value="rider">Rider</TabsTrigger>
            </TabsList>

            <TabsContent value="user" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-select">Select User</Label>
                <Select
                  value={selectedRecipientId}
                  onValueChange={setSelectedRecipientId}
                  disabled={loadingData}
                >
                  <SelectTrigger className="w-full" id="user-select">
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id!}>
                        {user.username || user.email || "Unknown User"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="rider" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rider-select">Select Rider</Label>
                <Select
                  value={selectedRecipientId}
                  onValueChange={setSelectedRecipientId}
                  disabled={loadingData}
                >
                  <SelectTrigger className="w-full" id="rider-select">
                    <SelectValue placeholder="Choose a rider" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {riders.map((rider) => (
                      <SelectItem key={rider.id} value={rider.id!}>
                        {rider.fullname || "Unknown Rider"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            {/* Wallet Balance Display - Only show for credit mode */}
            {transactionMode === "credit" && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">
                  Your Wallet Balance
                </p>
                <p className="text-2xl font-bold text-green-600">
                  ₦
                  {adminBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            )}

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            {/* Narration Input */}
            <div className="space-y-2">
              <Label htmlFor="narration">Narration</Label>
              <Input
                id="narration"
                type="text"
                placeholder="Enter transaction description"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || loadingData}>
              {loading ? "Sending..." : "Send Money"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
