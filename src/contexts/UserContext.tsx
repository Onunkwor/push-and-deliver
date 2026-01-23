import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { User } from "@/types";

interface UserContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  adminType?: "super" | "regular" | "customercare" | "verifier";
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
      // Query Admin collection where userid field equals the Firebase Auth UID
      const adminQuery = query(
        collection(db, "Admin"),
        where("userid", "==", uid),
        limit(1)
      );
      const querySnapshot = await getDocs(adminQuery);

      if (!querySnapshot.empty) {
        const adminDoc = querySnapshot.docs[0];
        const adminData = adminDoc.data();
        setUser({
          id: adminDoc.id,
          isAdmin: true,
          adminType: adminData.adminType,
          email: adminData.email,
          username: adminData.username,
          imageURL: adminData.imageURL,
          ...adminData,
        } as User);
      } else {
        console.warn(
          "User authenticated but no Admin document found for userid:",
          uid
        );
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to load admin profile:", error);
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
