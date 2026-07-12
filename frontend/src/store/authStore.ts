import { create } from "zustand";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "superadmin" | "admin" | "manager" | "technician" | "account";
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    localStorage.setItem("escm_token", token);
    localStorage.setItem("escm_user", JSON.stringify(user));
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem("escm_token");
    localStorage.removeItem("escm_user");
    set({ user: null, token: null });
  },
  loadFromStorage: () => {
    const token = localStorage.getItem("escm_token");
    const userStr = localStorage.getItem("escm_user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token });
      } catch {
        localStorage.removeItem("escm_token");
        localStorage.removeItem("escm_user");
      }
    }
  },
}));
