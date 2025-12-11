import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { usersService } from "@/services/users.service";
import type { User } from "@/types";

interface UserContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  adminType?: "super" | "regular" | "customercare";
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  isAdmin: false,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!isClerkLoaded) return;

      if (!clerkUser?.primaryEmailAddress?.emailAddress) {
        setLoading(false);
        setUser(null);
        return;
      }

      try {
        const firestoreUser = await usersService.getUserByEmail(
          clerkUser.primaryEmailAddress.emailAddress
        );
        setUser(firestoreUser);
      } catch (error) {
        console.error("Failed to load user profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [clerkUser, isClerkLoaded]);

  const isAdmin = user?.isAdmin === true;
  const adminType = user?.adminType;

  return (
    <UserContext.Provider
      value={{ user, loading: loading || !isClerkLoaded, isAdmin, adminType }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useCurrentUser = () => useContext(UserContext);
