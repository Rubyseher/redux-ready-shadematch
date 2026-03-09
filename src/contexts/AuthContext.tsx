import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth, isConfigured, onAuthStateChanged, type User } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  firebaseReady: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, firebaseReady: false });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isConfigured);

  useEffect(() => {
    if (!auth || !isConfigured) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, firebaseReady: isConfigured }}>
      {children}
    </AuthContext.Provider>
  );
}
