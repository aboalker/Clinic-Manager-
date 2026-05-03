import { createContext, useContext, ReactNode, useEffect } from "react";
import { useGetMe, AuthUser, getGetMeQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  logoutClient: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ["/login", "/signup"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError } = useGetMe({
    query: { retry: false, queryKey: getGetMeQueryKey() },
  });

  const logoutClient = () => {
    queryClient.setQueryData(getGetMeQueryKey(), null);
    queryClient.clear();
    setLocation("/login");
  };

  useEffect(() => {
    if (!isLoading && isError && !PUBLIC_PATHS.includes(location)) {
      setLocation("/login");
    }
  }, [isLoading, isError, location, setLocation]);

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, logoutClient }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
