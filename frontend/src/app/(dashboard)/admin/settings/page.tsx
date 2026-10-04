"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export default function SettingsPage() {
  const [company, setCompany] = useState<any>({});
  const [logo, setLogo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [smtp, setSmtp] = useState<any>({ host: "", port: 587, user: "", pass: "", secure: false, hasPass: false });
  const [smtpSaving, setSmtpSaving] = useState(false);
  const { user, token, setAuth } = useAuthStore();
  const [account, setAccount] = useState({ email: "", currentPassword: "", newPassword: "" });
  const [accSaving, setAccSaving] = useState(false);

  useEffect(() => {
    if (user?.email) setAccount((a) => ({ ...a, email: user.email }));
  }, [user?.email]);

  const saveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccSaving(true);
    try {
      const { data } = await api.put("/auth/me", account);
      toast.success("Admin account updated");
      if (token && data.user) setAuth(data.user, token);
      setAccount({ email: data.user?.email || account.email, currentPassword: "", newPassword: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setAccSaving(false);
    }
  };

  useEffect(() => {
    api.get("/settings/company").then((res) => setCompany(res.data.data || {}));
    api.get("/settings/smtp").then((res) => setSmtp({ ...res.data.data, pass: "" })).catch(() => {});
  }, []);

  const saveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmtpSaving(true);
    try {
      await api.put("/settings/smtp", { host: smtp.host, port: smtp.port, user: smtp.user, pass: smtp.pass, secure: smtp.secure });
      toast.success("Email (SMTP) settings saved");
      setSmtp({ ...smtp, pass: "", hasPass: smtp.hasPass || !!smtp.pass });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSmtpSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(company).forEach((key) => {
      if (key === "logo") return;
      if (key === "socialLinks") data.append(key, JSON.stringify(company.socialLinks || {}));
      else data.append(key, company[key] || "");
    });
    if (logo) data.append("logo", logo);

    try {
      await api.put("/settings/company", data, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Settings saved");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "name", label: "Company Name" },
    { name: "tagline", label: "Tagline" },
    { name: "phone", label: "Phone" },
    { name: "whatsapp", label: "WhatsApp" },
    { name: "email", label: "Email" },
    { name: "address", label: "Address" },
    { name: "website", label: "Website" },
    { name: "gstNumber", label: "GST Number" },
    { name: "upiId", label: "UPI ID" },
  ];
  const socialFields = [
    { name: "facebook", label: "Facebook", placeholder: "https://facebook.com/eletox" },
    { name: "instagram", label: "Instagram", placeholder: "https://instagram.com/eletox" },
    { name: "youtube", label: "YouTube", placeholder: "https://youtube.com/@eletox" },
    { name: "twitter", label: "Twitter / X", placeholder: "https://x.com/eletox" },
    { name: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/eletox" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium mb-1">{f.label}</label>
              <input
                className="border p-2 rounded w-full"
                value={company[f.name] || ""}
                onChange={(e) => setCompany({ ...company, [f.name]: e.target.value })}
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1">Logo</label>
            <input type="file" className="border p-2 rounded w-full" onChange={(e) => setLogo(e.target.files?.[0] || null)} />
            {company.logo && <img src={getImageUrl(company.logo)} alt="Current logo" className="mt-2 h-16 object-contain" />}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Social Links <span className="text-xs font-normal text-gray-500">(footer icons — leave blank to hide)</span></h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialFields.map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium mb-1">{f.label}</label>
                <input
                  className="border p-2 rounded w-full"
                  placeholder={f.placeholder}
                  value={company.socialLinks?.[f.name] || ""}
                  onChange={(e) => setCompany({ ...company, socialLinks: { ...(company.socialLinks || {}), [f.name]: e.target.value } })}
                />
              </div>
            ))}
          </div>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? "Saving..." : "Save Settings"}</button>
      </form>

      <form onSubmit={saveAccount} className="bg-white p-6 rounded-xl shadow space-y-4">
        <div>
          <h2 className="text-lg font-bold">Admin Account (Login Email &amp; Password)</h2>
          <p className="text-sm text-gray-500">OTP for new-device login and Forgot Password will be sent to this email. Keep it a real inbox you can access.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Login Email</label>
            <input type="email" className="border p-2 rounded w-full" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Current Password *</label>
            <input type="password" className="border p-2 rounded w-full" value={account.currentPassword} onChange={(e) => setAccount({ ...account, currentPassword: e.target.value })} required autoComplete="current-password" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Password (optional)</label>
            <input type="password" className="border p-2 rounded w-full" value={account.newPassword} onChange={(e) => setAccount({ ...account, newPassword: e.target.value })} autoComplete="new-password" />
          </div>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded" disabled={accSaving}>{accSaving ? "Saving..." : "Update Account"}</button>
      </form>

      <form onSubmit={saveSmtp} className="bg-white p-6 rounded-xl shadow space-y-4">
        <div>
          <h2 className="text-lg font-bold">Email (SMTP) for OTP &amp; Forgot Password</h2>
          <p className="text-sm text-gray-500">Admin new-device OTP and password reset emails are sent from this account. For Gmail: host smtp.gmail.com, port 587, and a Gmail App Password.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">SMTP Host</label>
            <input className="border p-2 rounded w-full" placeholder="smtp.gmail.com" value={smtp.host || ""} onChange={(e) => setSmtp({ ...smtp, host: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Port</label>
            <input className="border p-2 rounded w-full" type="number" value={smtp.port || ""} onChange={(e) => setSmtp({ ...smtp, port: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email (SMTP User)</label>
            <input className="border p-2 rounded w-full" placeholder="eletox07@gmail.com" value={smtp.user || ""} onChange={(e) => setSmtp({ ...smtp, user: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password / App Password {smtp.hasPass && <span className="text-xs text-green-600">(saved — leave blank to keep)</span>}</label>
            <input className="border p-2 rounded w-full" type="password" value={smtp.pass || ""} onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })} autoComplete="new-password" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!smtp.secure} onChange={(e) => setSmtp({ ...smtp, secure: e.target.checked })} /> Use SSL (port 465)
          </label>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded" disabled={smtpSaving}>{smtpSaving ? "Saving..." : "Save Email Settings"}</button>
      </form>
    </div>
  );
}
