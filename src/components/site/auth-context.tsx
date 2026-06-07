import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  name: string;
  email?: string;
  phone?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: (type?: "login" | "register") => void;
  closeAuthModal: () => void;
  authModalType: "login" | "register";
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<"login" | "register">("login");

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("aquapro_customer_token");
      const storedUser = localStorage.getItem("aquapro_customer_user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {}
  }, []);

  const login = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem("aquapro_customer_token", newToken);
    localStorage.setItem("aquapro_customer_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("aquapro_customer_token");
    localStorage.removeItem("aquapro_customer_user");
  };

  const openAuthModal = (type: "login" | "register" = "login") => {
    setAuthModalType(type);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthModalOpen, openAuthModal, closeAuthModal, authModalType }}>
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
