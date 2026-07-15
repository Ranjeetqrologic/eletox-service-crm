"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import toast from "react-hot-toast";

const empty = { title: "", subtitle: "", image: "", buttonText: "", buttonLink: "", order: 0, isActive: true };

export default function BannersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = () => api.get("/banners").then((res) => setItems(res.data.data || [])).catch(() => setItems([]));

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(form).forEach((k) => data.append(k, form[k] ?? ""));
    if (file) data.append("image", file);
    try {
      if (form._id) {
        await api.put(`/banners/${form._id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Banner updated");
      } else {
        await api.post("/banners", data, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Banner created");
      }
      setForm(empty);
      setFile(null);
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await api.delete(`/banners/${id}`);
      toast.success("Banner deleted");
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Banners / Slider</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border p-2 rounded" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="border p-2 rounded" placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Button Text" value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Button Link" value={form.buttonLink} onChange={(e) => setForm({ ...form, buttonLink: e.target.value })} />
          <input type="number" className="border p-2 rounded" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          <select className="border p-2 rounded" value={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <div>
            <input type="file" className="border p-2 rounded w-full" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <p className="text-xs text-gray-500 mt-1">{form._id ? "Leave empty to keep existing image" : "Required for new banner"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? "Saving..." : (form._id ? "Update" : "Add")}</button>
          {form._id && <button type="button" onClick={() => { setForm(empty); setFile(null); }} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>}
        </div>
      </form>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((b) => (
          <div key={b._id} className="bg-white p-4 rounded-xl shadow">
            {b.image && <img src={getImageUrl(b.image)} alt={b.title} className="w-full h-40 object-cover rounded mb-3" />}
            <h3 className="font-bold">{b.title}</h3>
            <p className="text-sm text-gray-600">{b.subtitle}</p>
            <div className="mt-2 text-sm">Order: {b.order} | {b.isActive ? "Active" : "Inactive"}</div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setForm(b)} className="text-primary-600 text-sm border px-2 py-1 rounded">Edit</button>
              <button onClick={() => handleDelete(b._id)} className="text-red-600 text-sm border px-2 py-1 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
