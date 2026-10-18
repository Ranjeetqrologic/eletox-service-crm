"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function LeadStatusPage() {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ name: "", label: "", color: "#6B7280", order: 0, isActive: true, showOnStaffDashboard: true, showOnAdminDashboard: true });
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const filteredStatuses = statuses.filter((s) => !search || [s.name, s.label].some((x: string) => x?.toLowerCase().includes(search.toLowerCase())));

  const fetchStatuses = () => api.get("/lead-status/all").then((res) => setStatuses(res.data.data));
  const [cardCfg, setCardCfg] = useState<Record<string, boolean>>({});
  const DASHBOARD_CARDS: [string, string][] = [
    ["newLeads", "New Leads"],
    ["pendingLeads", "Pending Leads"],
    ["assignedLeads", "Assigned Leads"],
    ["acceptedLeads", "Accepted Leads"],
    ["completedLeads", "Completed Leads"],
    ["totalLeads", "Total Leads"],
    ["todayLeads", "Today Leads"],
  ];
  const fetchCardCfg = () => api.get("/settings/company").then((res) => setCardCfg(res.data.data?.adminDashboardCards || {})).catch(() => {});
  const toggleCard = async (key: string) => {
    const next = { ...cardCfg, [key]: cardCfg[key] === false };
    const data = new FormData();
    data.append("adminDashboardCards", JSON.stringify(next));
    try {
      await api.put("/settings/company", data, { headers: { "Content-Type": "multipart/form-data" } });
      setCardCfg(next);
    } catch {
      toast.error("Update failed");
    }
  };

  useEffect(() => {
    fetchStatuses();
    fetchCardCfg();
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
      setForm({ name: "", label: "", color: "#6B7280", order: 0, isActive: true, showOnStaffDashboard: true, showOnAdminDashboard: true });
      setEditing(null);
      fetchStatuses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const editStatus = (s: any) => {
    setEditing(s);
    setForm({ name: s.name, label: s.label, color: s.color, order: s.order, isActive: s.isActive, showOnStaffDashboard: s.showOnStaffDashboard !== false, showOnAdminDashboard: s.showOnAdminDashboard !== false });
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold">Lead Status Management</h1>
        <div className="flex flex-wrap gap-2">
          <input className="border p-2 rounded min-w-[200px]" placeholder="Search status..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

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
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.showOnStaffDashboard} onChange={(e) => setForm({ ...form, showOnStaffDashboard: e.target.checked })} />
          Show on Staff Dashboard
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.showOnAdminDashboard} onChange={(e) => setForm({ ...form, showOnAdminDashboard: e.target.checked })} />
          Show on Admin Dashboard
        </label>
        <div className="flex gap-2">
          <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded">{editing ? "Update" : "Create"}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: "", label: "", color: "#6B7280", order: 0, isActive: true, showOnStaffDashboard: true, showOnAdminDashboard: true }); }} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>}
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
              <th className="p-3 text-left">Staff Dashboard</th>
              <th className="p-3 text-left">Admin Dashboard</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!search && DASHBOARD_CARDS.map(([key, label]) => (
              <tr key={key} className="border-t bg-gray-50">
                <td className="p-3 text-gray-500">{key}</td>
                <td className="p-3">{label}</td>
                <td className="p-3 text-gray-400">-</td>
                <td className="p-3 text-gray-400">-</td>
                <td className="p-3 text-gray-400">-</td>
                <td className="p-3 text-gray-400">-</td>
                <td className="p-3">
                  <button onClick={() => toggleCard(key)} className={`px-2.5 py-1 rounded-md text-xs font-medium ${cardCfg[key] !== false ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                    {cardCfg[key] !== false ? "Shown" : "Hidden"}
                  </button>
                </td>
                <td className="p-3 text-gray-400">-</td>
              </tr>
            ))}
            {filteredStatuses.map((s) => (
              <tr key={s._id} className="border-t">
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.label}</td>
                <td className="p-3"><span className="inline-block w-6 h-6 rounded" style={{ backgroundColor: s.color }} /></td>
                <td className="p-3">{s.order}</td>
                <td className="p-3">{s.isActive ? "Yes" : "No"}</td>
                <td className="p-3">
                  <button onClick={() => api.put(`/lead-status/${s._id}`, { showOnStaffDashboard: s.showOnStaffDashboard === false }).then(fetchStatuses)} className={`px-2.5 py-1 rounded-md text-xs font-medium ${s.showOnStaffDashboard !== false ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                    {s.showOnStaffDashboard !== false ? "Shown" : "Hidden"}
                  </button>
                </td>
                <td className="p-3">
                  <button onClick={() => api.put(`/lead-status/${s._id}`, { showOnAdminDashboard: s.showOnAdminDashboard === false }).then(fetchStatuses)} className={`px-2.5 py-1 rounded-md text-xs font-medium ${s.showOnAdminDashboard !== false ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                    {s.showOnAdminDashboard !== false ? "Shown" : "Hidden"}
                  </button>
                </td>
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
