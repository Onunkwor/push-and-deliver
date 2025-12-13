// src/components/layout.tsx
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/contexts/UserContext";
import { TransactModal } from "@/components/TransactModal";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useCurrentUser();
  const [transactModalOpen, setTransactModalOpen] = useState(false);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="border-b">
          <div className="flex h-16 items-center px-4 gap-4 justify-between">
            <SidebarTrigger />
            {user?.adminType === "super" && (
              <Button size="sm" onClick={() => setTransactModalOpen(true)}>
                Transact
              </Button>
            )}
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>

      <TransactModal
        open={transactModalOpen}
        onOpenChange={setTransactModalOpen}
      />
    </SidebarProvider>
  );
}
