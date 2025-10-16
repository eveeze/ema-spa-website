// src/contexts/AuthContext.tsx
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import apiClient from "../api/apiClient";
import { Customer } from "../types";

// Definisikan tipe untuk data pengguna dan token
interface AuthState {
  isAuthenticated: boolean;
  user: Customer | null;
  token: string | null;
  isLoading: boolean;
}

// Tipe untuk fungsi yang akan diekspos oleh context
interface AuthContextType extends AuthState {
  login: (token: string, user: Customer) => void;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: localStorage.getItem("authToken"),
    isLoading: true,
  });

  const checkAuthStatus = useCallback(async () => {
    if (!authState.token) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    // Set header authorization untuk request ini
    apiClient.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${authState.token}`;

    try {
      // Panggil endpoint /profile untuk validasi token
      const response = await apiClient.get("/customer/profile");
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: true,
        user: response.data,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Token tidak valid atau sesi berakhir:", error);
      localStorage.removeItem("authToken");
      delete apiClient.defaults.headers.common["Authorization"];
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      });
    }
  }, [authState.token]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = (newToken: string, userData: Customer) => {
    localStorage.setItem("authToken", newToken);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setAuthState({
      isAuthenticated: true,
      user: userData,
      token: newToken,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    delete apiClient.defaults.headers.common["Authorization"];
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
    });
    // Arahkan ke halaman login atau home setelah logout
    window.location.href = "/login";
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {!authState.isLoading && children}
    </AuthContext.Provider>
  );
};
