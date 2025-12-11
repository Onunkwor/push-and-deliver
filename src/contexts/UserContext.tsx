import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user details from Firestore using uid
          const firestoreUser = await usersService.getUserById(
            firebaseUser.uid
          );

          if (firestoreUser) {
            setUser(firestoreUser);
          } else {
            // Fallback if user document doesn't exist yet (should exist from signup/login logic)
            console.warn(
              "User authenticated but no Firestore document found for ID:",
              firebaseUser.uid
            );
            // Optionally you could set a minimal user object here or set null
            setUser(null);
          }
        } catch (error) {
          console.error("Failed to load user profile:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = user?.isAdmin === true;
  const adminType = user?.adminType;

  return (
    <UserContext.Provider value={{ user, loading, isAdmin, adminType }}>
      {children}
    </UserContext.Provider>
  );
}

export const useCurrentUser = () => useContext(UserContext);
