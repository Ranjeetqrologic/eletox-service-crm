"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { homeForRole } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import Logo from "@/components/Logo";
import toast from "react-hot-toast";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const DEVICE_KEY = "escm_device_id";

const getDeviceId = () => {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
};

const deviceLabel = () => (typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 120) : "");

type Mode = "login" | "otp" | "forgot" | "reset";

export default function LoginForm({ portal }: { portal: "admin" | "staff" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<any>({});
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const isAdmin = portal === "admin";

  useEffect(() => {
    api.get("/settings/company").then((res) => setCompany(res.data.data || {})).catch(() => setCompany({}));
  }, []);

  const finishLogin = (data: any) => {
    setAuth(data.user, data.token);
    toast.success("Login successful");
    router.replace(homeForRole(data.user.role));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password, portal, deviceId: getDeviceId(), deviceLabel: deviceLabel() });
      if (data.otpRequired) {
        toast.success(data.message || "OTP sent to your email");
        setMode("otp");
        return;
      }
      finishLogin(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-otp", { email, otp, deviceId: getDeviceId(), deviceLabel: deviceLabel() });
      finishLogin(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      toast.success(data.message || "OTP sent");
      setMode("reset");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/reset-password", { email, otp, password: newPassword });
      toast.success(data.message || "Password reset");
      setOtp("");
      setPassword("");
      setMode("login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border p-3 rounded";
  const btnCls = "w-full bg-primary-600 text-white py-3 rounded font-semibold hover:bg-primary-700 disabled:opacity-50";

  const passwordField = (value: string, onChange: (v: string) => void, placeholder: string) => (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} pr-12`}
        required
      />
      <button
        type="button"
        onClick={() => setShowPassword((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
        aria-label={showPassword ? "Hide password" : "Show password"}
        title={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-4">
          <Logo logoUrl={company.logo} />
        </div>
        <h1 className="text-2xl font-bold text-center mb-1">{isAdmin ? "Admin Login" : "Staff Login"}</h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          {isAdmin ? "Authorised administrators only" : "Login with the ID & password given by admin"}
        </p>

        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email / Login ID" className={inputCls} required />
            {passwordField(password, setPassword, "Password")}
            <button type="submit" disabled={loading} className={btnCls}>{loading ? "Logging in..." : "Login"}</button>
            {isAdmin ? (
              <button type="button" onClick={() => setMode("forgot")} className="w-full text-sm text-primary-600 hover:underline">Forgot Password?</button>
            ) : (
              <p className="text-center text-xs text-gray-500">Forgot your password? Please contact your admin to reset it.</p>
            )}
          </form>
        )}

        {mode === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-gray-600 text-center">New device detected. Enter the OTP sent to <b>{email}</b>.</p>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" inputMode="numeric" maxLength={6} className={`${inputCls} text-center tracking-widest text-lg`} required />
            <button type="submit" disabled={loading} className={btnCls}>{loading ? "Verifying..." : "Verify OTP & Login"}</button>
            <button type="button" onClick={() => { setMode("login"); setOtp(""); }} className="w-full text-sm text-gray-500 hover:underline">Back to login</button>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={handleForgot} className="space-y-4">
            <p className="text-sm text-gray-600 text-center">Enter your admin email. We will send an OTP to reset your password.</p>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin Email" className={inputCls} required />
            <button type="submit" disabled={loading} className={btnCls}>{loading ? "Sending..." : "Send OTP"}</button>
            <button type="button" onClick={() => setMode("login")} className="w-full text-sm text-gray-500 hover:underline">Back to login</button>
          </form>
        )}

        {mode === "reset" && (
          <form onSubmit={handleReset} className="space-y-4">
            <p className="text-sm text-gray-600 text-center">Enter the OTP sent to <b>{email}</b> and your new password.</p>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" inputMode="numeric" maxLength={6} className={`${inputCls} text-center tracking-widest text-lg`} required />
            {passwordField(newPassword, setNewPassword, "New Password (min 6 characters)")}
            <button type="submit" disabled={loading} className={btnCls}>{loading ? "Resetting..." : "Reset Password"}</button>
            <button type="button" onClick={() => setMode("login")} className="w-full text-sm text-gray-500 hover:underline">Back to login</button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-gray-400">
          {isAdmin ? <Link href="/staff-login/" className="hover:underline">Staff login →</Link> : <Link href="/admin-login/" className="hover:underline">Admin login →</Link>}
        </div>
      </div>
    </div>
  );
}
