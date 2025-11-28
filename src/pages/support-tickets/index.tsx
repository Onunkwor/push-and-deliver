"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supportService } from "@/services/support.service";
import type { SupportTicket, TicketMessage } from "@/types";
import { format, isToday, isYesterday } from "date-fns";
import { Send, User as UserIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconInfoCircle } from "@tabler/icons-react";

// Helper function to format time WhatsApp-style
const formatWhatsAppTime = (date: Date) => {
  if (isToday(date)) {
    return format(date, "h:mm a");
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else {
    return format(date, "dd/MM/yy");
  }
};

export default function SupportTicketsPage() {
  const { user } = useUser();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Subscribe to tickets
  useEffect(() => {
    const unsubscribe = supportService.getSupportTickets((data) => {
      setTickets(data);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to messages when a ticket is selected
  useEffect(() => {
    if (!selectedTicket?.id) return;

    const unsubscribe = supportService.getTicketMessages(
      selectedTicket.id,
      (data) => {
        setMessages(data);
        // Scroll to bottom on new messages
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    );
    return () => unsubscribe();
  }, [selectedTicket?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket?.id || !user?.id) return;

    try {
      setSending(true);
      await supportService.sendSupportMessage(
        selectedTicket.id,
        user.id.split("_")[1],
        newMessage
      );
      setNewMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleStatusToggle = async (checked: boolean) => {
    if (!selectedTicket?.id || !user?.id) return;

    const newStatus = checked ? "closed" : "open";

    // Prevent reopening closed tickets
    if (selectedTicket.status === "closed" && newStatus === "open") {
      toast.error("Closed tickets cannot be reopened");
      return;
    }

    try {
      setUpdatingStatus(true);
      await supportService.updateTicketStatus(selectedTicket.id, newStatus);

      if (newStatus === "closed") {
        // Send closing message to user
        const closingMessage =
          newMessage.trim() ||
          "This ticket is now closed, I hope all your issues have been resolved. If you have any other issues, please open a new ticket.";

        await supportService.sendSupportMessage(
          selectedTicket.id,
          user.id.split("_")[1],
          closingMessage
        );

        toast.success("Ticket closed");

        // Clear the message input and close the ticket view after 1.5 seconds
        setTimeout(() => {
          setSelectedTicket(null);
          setNewMessage("");
        }, 1500);
      } else {
        toast.success("Ticket reopened");
      }

      // Update local state
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    } catch (error) {
      toast.error("Failed to update ticket status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="flex h-[85vh] overflow-hidden rounded-lg border bg-background shadow-sm">
      {/* Left Sidebar - Ticket List */}
      <div className="w-1/3 border-r flex flex-col min-w-[300px]">
        <div className="p-4 border-b bg-muted/30">
          <h2 className="font-semibold text-lg">Support Tickets</h2>
        </div>
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="flex flex-col">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => {
                  if (ticket.status === "closed") {
                    toast.error("This ticket is closed and cannot be opened");
                    return;
                  }
                  setSelectedTicket(ticket);
                }}
                className={cn(
                  "flex flex-col gap-1 p-4 text-left transition-colors border-b",
                  ticket.status === "closed"
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-muted/50",
                  selectedTicket?.id === ticket.id && "bg-muted"
                )}
                disabled={ticket.status === "closed"}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-xs font-medium truncate max-w-[50%] text-muted-foreground">
                    {ticket.id}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {ticket.updatedAt
                      ? formatWhatsAppTime(new Date(ticket.updatedAt as Date))
                      : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between w-full mt-1">
                  <span className="text-sm truncate text-foreground/90 font-medium w-1/3 truncate">
                    {ticket.lastMessage || "No messages"}
                  </span>
                </div>
              </button>
            ))}
            {tickets.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No tickets found
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Main Area - Chat Interface with Grid Layout */}
      <div className="flex-1 bg-muted/10 overflow-hidden">
        {selectedTicket ? (
          <div className="h-full grid grid-rows-[auto_1fr_auto]">
            {/* Chat Header - Fixed */}
            <div className="p-4 border-b bg-background flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    <UserIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-sm">
                    Ticket #{selectedTicket.id}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    User ID: {selectedTicket.userId}
                  </p>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger>
                    <IconInfoCircle size={12} />
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>
                      Close ticket (On closing a ticket, it cannot be reopened.)
                    </p>
                  </TooltipContent>
                </Tooltip>
                <Label htmlFor="ticket-status" className="text-sm">
                  {selectedTicket.status === "closed" ? "Closed" : "Open"}
                </Label>
                <Switch
                  id="ticket-status"
                  checked={selectedTicket.status === "closed"}
                  onCheckedChange={handleStatusToggle}
                  disabled={
                    updatingStatus || selectedTicket.status === "closed"
                  }
                />
              </div>
            </div>

            {/* Messages Area - Scrollable */}
            <ScrollArea className="px-4 overflow-y-auto">
              <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                {messages.map((msg, index) => {
                  const isUser = msg.senderId === selectedTicket.userId;
                  const isFirst = index === 0;
                  const isLast = index === messages.length - 1;

                  return (
                    <div
                      key={msg.id || index}
                      className={cn(
                        "flex w-fit max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                        !isUser
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted",
                        isFirst && "mt-4",
                        isLast && "mb-4"
                      )}
                    >
                      {msg.imageurl ? (
                        <img
                          src={msg.imageurl}
                          alt="attachment"
                          className="rounded-md max-w-full max-h-[400px] w-auto object-contain bg-black/5"
                        />
                      ) : null}
                      {msg.message && <p>{msg.message}</p>}
                      <span
                        className={cn(
                          "text-[10px] opacity-70",
                          !isUser
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {msg.timestamp
                          ? format(new Date(msg.timestamp as Date), "h:mm a")
                          : ""}
                      </span>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input Area - Fixed */}
            <div className="p-4 bg-background border-t">
              <form
                ref={formRef}
                onSubmit={handleSendMessage}
                className="flex gap-2 max-w-3xl mx-auto"
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={sending}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={sending || !newMessage.trim()}
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/5">
            <div className="text-center">
              <h3 className="text-lg font-medium">No Ticket Selected</h3>
              <p className="text-sm mt-1">
                Click a support ticket to see messages sent
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
