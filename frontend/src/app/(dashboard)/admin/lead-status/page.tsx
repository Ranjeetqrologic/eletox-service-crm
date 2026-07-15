"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function LeadStatusPage() {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ name: "", label: "", color: "#6B7280", order: 0, isActive: true });
  const [editing, setEditing] = useState<any>(null);

  const fetchStatuses = () => api.get("/lead-status/all").then((res) => setStatuses(res.data.data));

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/lead-status/${editing._id}`, form);
        toast.success("Status updated");
      } else {
        await api.post("/lead-status", { ...form, name: form.name.toLowerCase().replace(/\s+/g, "_") });
        toast.success("Status created");
      }
      setForm({ name: "", label: "", color: "#6B7280", order: 0, isActive: true });
      setEditing(null);
      fetchStatuses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const editStatus = (s: any) => {
    setEditing(s);
    setForm({ name: s.name, label: s.label, color: s.color, order: s.order, isActive: s.isActive });
  };

  const deleteStatus = async (id: string) => {
    if (!confirm("Delete this status?")) return;
    try {
      await api.delete(`/lead-status/${id}`);
      toast.success("Status deleted");
      fetchStatuses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Lead Status Management</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow grid md:grid-cols-6 gap-4 items-end">
        <input required disabled={!!editing} placeholder="Status key (e.g. half_done)" className="border p-2 rounded" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required placeholder="Display label" className="border p-2 rounded" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        <div className="flex items-center gap-2">
          <input type="color" className="h-10 w-10 border rounded" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
          <span className="text-sm text-gray-500">Color</span>
        </div>
        <input type="number" placeholder="Order" className="border p-2 rounded" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          Active
        </label>
        <div className="flex gap-2">
          <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded">{editing ? "Update" : "Create"}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: "", label: "", color: "#6B7280", order: 0, isActive: true }); }} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>}
        </div>
      </form>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Label</th>
              <th className="p-3 text-left">Color</th>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Active</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {statuses.map((s) => (
              <tr key={s._id} className="border-t">
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.label}</td>
                <td className="p-3"><span className="inline-block w-6 h-6 rounded" style={{ backgroundColor: s.color }} /></td>
                <td className="p-3">{s.order}</td>
                <td className="p-3">{s.isActive ? "Yes" : "No"}</td>
                <td className="p-3 space-x-2">
                  <button onClick={() => editStatus(s)} className="text-blue-600 hover:underline">Edit</button>
                  {!s.isDefault && <button onClick={() => deleteStatus(s._id)} className="text-red-600 hover:underline">Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
