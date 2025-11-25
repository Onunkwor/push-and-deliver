import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SupportTicket, TicketMessage } from "@/types";

const COLLECTION_NAME = "SupportTickets";
const MESSAGES_SUBCOLLECTION = "Messages";

export const supportService = {
  // Get all support tickets
  getSupportTickets: (callback: (tickets: SupportTicket[]) => void) => {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("updatedAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const tickets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as SupportTicket[];
      callback(tickets);
    });
  },

  // Get messages for a specific ticket
  getTicketMessages: (
    ticketId: string,
    callback: (messages: TicketMessage[]) => void
  ) => {
    const q = query(
      collection(db, COLLECTION_NAME, ticketId, MESSAGES_SUBCOLLECTION),
      orderBy("timestamp", "asc")
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        timestamp: doc.data().timestamp?.toDate(),
      })) as TicketMessage[];
      callback(messages);
    });
  },

  // Send a support message via Cloud Function
  sendSupportMessage: async (
    ticketId: string,
    userId: string,
    message: string
  ) => {
    try {
      const formData = new FormData();
      formData.append("ticketId", ticketId);
      formData.append("userId", userId);
      formData.append("message", message);

      const response = await fetch(
        "https://us-central1-pushndeliver-dev.cloudfunctions.net/createSupportTicketMessage",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending support message:", error);
      throw error;
    }
  },
};
