import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usersService } from "@/services/users.service";
import type { User } from "@/types";

interface UserContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  adminType?: "super" | "regular" | "customercare";
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  refetchUser: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUid, setCurrentUid] = useState<string | null>(null);

  const fetchUserData = useCallback(async (uid: string) => {
    try {
      const firestoreUser = await usersService.getUserById(uid);
      if (firestoreUser) {
        setUser(firestoreUser);
      } else {
        console.warn(
          "User authenticated but no Firestore document found for ID:",
          uid
        );
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
      setUser(null);
    }
  }, []);

  const refetchUser = useCallback(async () => {
    if (currentUid) {
      await fetchUserData(currentUid);
    }
  }, [currentUid, fetchUserData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUid(firebaseUser.uid);
        await fetchUserData(firebaseUser.uid);
      } else {
        setCurrentUid(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  const isAdmin = user?.isAdmin === true;
  const adminType = user?.adminType;

  return (
    <UserContext.Provider
      value={{ user, loading, isAdmin, adminType, refetchUser }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useCurrentUser = () => useContext(UserContext);
