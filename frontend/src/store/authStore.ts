import { create } from "zustand";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "superadmin" | "admin" | "manager" | "technician" | "account";
}

const readStoredAuth = () => {
  if (typeof window === "undefined") return { user: null, token: null };
  try {
    const token = localStorage.getItem("escm_token");
    const userStr = localStorage.getItem("escm_user");
    if (token && userStr) {
      return { token, user: JSON.parse(userStr) as User };
    }
  } catch {
    localStorage.removeItem("escm_token");
    localStorage.removeItem("escm_user");
  }
  return { user: null, token: null };
};

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: readStoredAuth().user,
  token: readStoredAuth().token,
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
}));
