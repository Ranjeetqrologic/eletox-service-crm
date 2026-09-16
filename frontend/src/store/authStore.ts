import { create } from "zustand";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export const IMPERSONATE_KEY = "escm_impersonate";

// An impersonated ("Login As") session lives in sessionStorage so it is
// scoped to its own tab and does not overwrite the admin's localStorage session.
export const authStorage = (): Storage => {
  if (typeof window !== "undefined" && sessionStorage.getItem("escm_token")) return sessionStorage;
  return localStorage;
};

export const getStoredToken = () =>
  typeof window === "undefined" ? null : sessionStorage.getItem("escm_token") || localStorage.getItem("escm_token");

const readStoredAuth = () => {
  if (typeof window === "undefined") return { user: null, token: null };
  const storage = authStorage();
  try {
    const token = storage.getItem("escm_token");
    const userStr = storage.getItem("escm_user");
    if (token && userStr) {
      return { token, user: JSON.parse(userStr) as User };
    }
  } catch {
    storage.removeItem("escm_token");
    storage.removeItem("escm_user");
  }
  return { user: null, token: null };
};

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  setImpersonatedAuth: (user: User, token: string) => void;
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
  setImpersonatedAuth: (user, token) => {
    sessionStorage.setItem("escm_token", token);
    sessionStorage.setItem("escm_user", JSON.stringify(user));
    set({ user, token });
  },
  logout: () => {
    const storage = authStorage();
    storage.removeItem("escm_token");
    storage.removeItem("escm_user");
    set({ user: null, token: null });
  },
}));
