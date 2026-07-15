"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import toast from "react-hot-toast";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ title: "", slug: "", shortDesc: "", description: "", image: "", price: "", order: 0, isActive: true });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const fetchServices = () => api.get("/services").then((res) => setServices(res.data.data || []));

  useEffect(() => { fetchServices(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, price: form.price ? Number(form.price) : undefined, order: Number(form.order) };
      if (editing) {
        await api.put(`/services/${editing}`, payload);
        toast.success("Service updated");
      } else {
        await api.post("/services", payload);
        toast.success("Service created");
      }
      setForm({ title: "", slug: "", shortDesc: "", description: "", image: "", price: "", order: 0, isActive: true });
      setEditing(null);
      fetchServices();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm("Delete?")) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success("Deleted");
      fetchServices();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Services</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="border p-2 rounded" placeholder="Title*" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="border p-2 rounded" placeholder="Slug*" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} required />
          <input className="border p-2 rounded" type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input className="border p-2 rounded" type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          <select className="border p-2 rounded" value={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <input className="border p-2 rounded w-full md:col-span-3" placeholder="Image URL (e.g. /eletox-assets/icon-ac.png)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        </div>
        {form.image && <img src={getImageUrl(form.image)} alt="Preview" className="w-16 h-16 object-cover rounded border" />}
        <input className="border p-2 rounded w-full" placeholder="Short Description*" value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} required />
        <textarea className="border p-2 rounded w-full" rows={4} placeholder="Full Description*" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <button className="bg-primary-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? "Saving..." : editing ? "Update" : "Add Service"}</button>
      </form>

      <div className="grid md:grid-cols-2 gap-4">
        {services.map((s) => (
          <div key={s._id} className="bg-white p-4 rounded-xl shadow flex justify-between items-start">
            <div className="flex gap-3">
              {s.image && <img src={getImageUrl(s.image)} alt={s.title} className="w-14 h-14 object-cover rounded" />}
              <div>
                <h3 className="font-bold">{s.title}</h3>
                <p className="text-sm text-gray-600">{s.shortDesc}</p>
                <p className="text-xs text-gray-400 mt-1">/{s.slug} · ₹{s.price || 0} · {s.isActive ? "Active" : "Inactive"}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setForm(s); setEditing(s._id); }} className="text-blue-600 text-sm">Edit</button>
              <button onClick={() => deleteService(s._id)} className="text-red-600 text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
