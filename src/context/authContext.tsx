// src/contexts/AuthContext.tsx

import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
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
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 1. Ambil token langsung saat inisialisasi state
  const initialToken = localStorage.getItem("authToken");

  // 2. Set default header jika token ada
  if (initialToken) {
    apiClient.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${initialToken}`;
  }

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: !!initialToken, // Jika ada token, anggap login sementara (optimistic)
    user: null,
    token: initialToken,
    isLoading: true, // Loading awal untuk fetch profile
  });

  // 3. Fungsi Login
  const login = useCallback((newToken: string, userData: Customer) => {
    localStorage.setItem("authToken", newToken);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

    setAuthState({
      isAuthenticated: true,
      user: userData,
      token: newToken,
      isLoading: false,
    });
  }, []);

  // 4. Fungsi Logout
  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    delete apiClient.defaults.headers.common["Authorization"];

    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
    });

    window.location.href = "/login";
  }, []);

  // 5. Cek Validitas Token (Fetch Profile)
  useEffect(() => {
    const initAuth = async () => {
      // Jika tidak ada token, stop loading, set user logout
      if (!initialToken) {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
        }));
        return;
      }

      try {
        // Token ada, validasi ke server
        const response = await apiClient.get("/customer/profile");
        setAuthState({
          isAuthenticated: true,
          user: response.data,
          token: initialToken,
          isLoading: false,
        });
      } catch (error) {
        console.error("Sesi berakhir:", error);
        // Jika token invalid, lakukan logout diam-diam (tanpa redirect paksa jika tidak perlu)
        localStorage.removeItem("authToken");
        delete apiClient.defaults.headers.common["Authorization"];
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []); // Empty dependency array: Hanya jalan sekali saat mount (refresh)

  // 6. Memoize value agar tidak re-render berlebihan
  const value = useMemo<AuthContextType>(
    () => ({
      ...authState,
      login,
      logout,
      // checkAuthStatus dihapus dari export karena sudah otomatis via useEffect
    }),
    [authState, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {/* ✅ PERBAIKAN: Selalu render children.
        Biarkan halaman masing-masing yang menangani UI loading 
        berdasarkan `isLoading` dari context jika diperlukan.
      */}
      {children}
    </AuthContext.Provider>
  );
};
