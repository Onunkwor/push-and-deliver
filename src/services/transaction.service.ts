import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  Timestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface TransferMoneyParams {
  senderId: string;
  senderType: "admin" | "user" | "rider";
  recipientId: string;
  recipientType: "user" | "rider";
  amount: number;
  narration: string;
}

// Generate unique transaction reference
// Format: PnD-{first6CharsOfUID}-{timestamp}
const generateTrxRef = (userId: string): string => {
  const timestamp = Date.now();
  const uid6 = userId.substring(0, 6);
  return `PnD-${uid6}-${timestamp}`;
};

export const transactionService = {
  async transferMoney({
    senderId,
    senderType,
    recipientId,
    recipientType,
    amount,
    narration,
  }: TransferMoneyParams): Promise<void> {
    const trxRef = generateTrxRef(senderId);
    const currentTime = Timestamp.now();

    // Determine collection names based on type
    const getSenderCollection = () => {
      if (senderType === "admin") return "Admins";
      if (senderType === "user") return "Users";
      return "Riders";
    };

    const getRecipientCollection = () => {
      return recipientType === "user" ? "Users" : "Riders";
    };

    const senderCollection = getSenderCollection();
    const recipientCollection = getRecipientCollection();

    try {
      // Use Firestore transaction to ensure atomicity
      await runTransaction(db, async (transaction) => {
        // 1. Get sender and recipient documents
        console.log(senderCollection, senderId);
        const senderRef = doc(db, senderCollection, senderId);
        const recipientRef = doc(db, recipientCollection, recipientId);

        const senderDoc = await transaction.get(senderRef);
        const recipientDoc = await transaction.get(recipientRef);

        if (!senderDoc.exists()) {
          throw new Error("Sender not found");
        }

        if (!recipientDoc.exists()) {
          throw new Error("Recipient not found");
        }

        const senderData = senderDoc.data();
        const recipientData = recipientDoc.data();

        const senderBalance = senderData.walletbalance || 0;
        const recipientBalance = recipientData.walletbalance || 0;

        // 2. Validate sender has sufficient balance
        if (senderBalance < amount) {
          throw new Error("Insufficient wallet balance");
        }

        // 3. Update wallet balances
        transaction.update(senderRef, {
          walletbalance: senderBalance - amount,
        });

        transaction.update(recipientRef, {
          walletbalance: recipientBalance + amount,
        });

        // 4. Create transaction records
        // Debit transaction for sender
        const senderTransactionRef = collection(
          db,
          senderCollection,
          senderId,
          "Transactions"
        );
        const senderTransactionData = {
          amount: amount,
          narration: narration,
          status: 0, // TransactionStatus: success
          time: currentTime,
          transactionType: 1, // Debit
          trxref: trxRef,
          userId: recipientId, // ID of the recipient
        };

        // Use set instead of addDoc in transaction
        const newSenderTxnRef = doc(senderTransactionRef);
        transaction.set(newSenderTxnRef, senderTransactionData);

        // Credit transaction for recipient
        const recipientTransactionRef = collection(
          db,
          recipientCollection,
          recipientId,
          "Transactions"
        );
        const recipientTransactionData = {
          amount: amount,
          narration: narration,
          status: 0, // TransactionStatus: success
          time: currentTime,
          transactionType: 0, // Credit
          trxref: trxRef,
          userId: senderId, // ID of the sender
        };

        const newRecipientTxnRef = doc(recipientTransactionRef);
        transaction.set(newRecipientTxnRef, recipientTransactionData);
      });

      console.log("Transaction completed successfully:", trxRef);
    } catch (error: any) {
      console.error("Transaction error:", error);
      throw new Error(error.message || "Transaction failed");
    }
  },
};
