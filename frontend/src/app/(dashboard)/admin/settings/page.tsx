"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [company, setCompany] = useState<any>({});
  const [logo, setLogo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/settings/company").then((res) => setCompany(res.data.data || {}));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(company).forEach((key) => {
      if (key !== "logo") data.append(key, company[key] || "");
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
        <button className="bg-primary-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? "Saving..." : "Save Settings"}</button>
      </form>
    </div>
  );
}
