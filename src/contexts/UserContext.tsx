import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { User } from "@/types";

interface UserContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  adminType?: "super" | "regular" | "customercare" | "verifier" | "";
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
      // Get user document from Users collection using Firebase Auth UID
      const userRef = doc(db, "Users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();

        // Check if user is an admin using the isAdmin field
        if (userData.isAdmin === true) {
          setUser({
            id: userSnap.id,
            isAdmin: true,
            adminType: userData.adminType || "regular",
            email: userData.email,
            username: userData.username,
            imageURL: userData.imageURL,
            ...userData,
          } as User);
        } else {
          console.warn(
            "User authenticated but is not an admin:",
            uid
          );
          setUser(null);
        }
      } else {
        console.warn(
          "User authenticated but no User document found for uid:",
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
