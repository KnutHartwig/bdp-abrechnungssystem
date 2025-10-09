import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation, useNavigate } from "wouter";

interface User {
  id: number;
  name: string;
  email: string;
  rolle: "ADMIN" | "LANDESKASSE";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isLandeskasse: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useNavigate();

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Fehler beim Laden des Benutzers:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async () => {
    try {
      const response = await fetch("/api/auth/login", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Login fehlgeschlagen");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Login-Fehler:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setUser(null);
        navigate("/admin/login");
      }
    } catch (error) {
      console.error("Logout-Fehler:", error);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const isAdmin = user?.rolle === "ADMIN" || user?.rolle === "LANDESKASSE";
  const isLandeskasse = user?.rolle === "LANDESKASSE";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin,
        isLandeskasse,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth muss innerhalb von AuthProvider verwendet werden");
  }
  return context;
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [, navigate] = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

export function LandeskasseRoute({ children }: { children: ReactNode }) {
  const { user, loading, isLandeskasse } = useAuth();
  const [, navigate] = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login");
    } else if (!loading && user && !isLandeskasse) {
      navigate("/admin");
    }
  }, [user, loading, isLandeskasse, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isLandeskasse) {
    return null;
  }

  return <>{children}</>;
}
