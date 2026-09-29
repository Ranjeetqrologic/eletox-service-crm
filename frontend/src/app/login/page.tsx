"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { homeForRole } from "@/lib/utils";
import { useAuthStore, IMPERSONATE_KEY } from "@/store/authStore";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { setImpersonatedAuth } = useAuthStore();

  useEffect(() => {
    if (window.location.search.includes("impersonate=1")) {
      const raw = localStorage.getItem(IMPERSONATE_KEY);
      localStorage.removeItem(IMPERSONATE_KEY);
      if (raw) {
        try {
          const { user, token } = JSON.parse(raw);
          setImpersonatedAuth(user, token);
          toast.success(`Logged in as ${user.name}`);
          router.replace(homeForRole(user.role));
          return;
        } catch {
          toast.error("Login As failed");
        }
      }
    }
    router.replace("/admin-login/");
  }, [router, setImpersonatedAuth]);

  return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-500">Redirecting...</div>;
}
