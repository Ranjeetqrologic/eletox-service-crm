"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

const statuses = ["new", "assigned", "accepted", "on_the_way", "reached", "working", "need_parts", "pending", "follow_up", "completed", "cancelled", "closed"];
const sources = ["website", "call", "whatsapp", "facebook", "instagram", "google_ads", "referral", "manual", "others"];
const priorities = ["low", "medium", "high", "urgent"];

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ status: "new", priority: "medium", source: "manual" });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchLeads = () => api.get("/leads").then((res) => setLeads(res.data.data));
  const fetchStaff = () => api.get("/staff").then((res) => setStaff(res.data.data));

  useEffect(() => {
    fetchLeads();
    fetchStaff();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/leads", form);
      toast.success("Lead created");
      setShowForm(false);
      setForm({ status: "new", priority: "medium", source: "manual" });
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const assignLead = async (leadId: string, staffId: string) => {
    try {
      await api.put(`/leads/${leadId}/assign`, { staffId });
      toast.success("Assigned");
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const changeStatus = async (leadId: string, status: string) => {
    try {
      await api.put(`/leads/${leadId}/status`, { status });
      toast.success("Status updated");
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const updateFollowUp = async (leadId: string, followUpDate: string, followUpNote: string) => {
    try {
      await api.put(`/leads/${leadId}`, { followUpDate, followUpNote });
      toast.success("Follow-up updated");
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const sendReminders = async () => {
    try {
      const res = await api.post("/reminders/send-followups");
      toast.success(res.data.message || "Reminders sent");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const exportCSV = () => {
    const rows = leads.map((l) => [
      l.leadId, l.customerName, l.mobile, l.service, l.status,
      l.assignedStaff?.name || "", l.city, l.priority, l.source,
      l.followUpDate ? new Date(l.followUpDate).toLocaleDateString() : "",
    ]);
    const csv = ["Lead ID,Customer,Mobile,Service,Status,Assigned,City,Priority,Source,FollowUp"].concat(rows.map((r) => r.join(","))).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch = [l.customerName, l.mobile, l.leadId].some((x) => x?.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !filterStatus || l.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold">Lead Management</h1>
        <div className="flex gap-2">
          <input className="border p-2 rounded" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="border p-2 rounded" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={sendReminders} className="bg-yellow-500 text-white px-4 py-2 rounded">Remind</button>
          <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded">Export</button>
          <button onClick={() => setShowForm(!showForm)} className="bg-primary-600 text-white px-4 py-2 rounded">{showForm ? "Close" : "+ New Lead"}</button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow grid md:grid-cols-4 gap-4">
          <input required placeholder="Customer Name*" className="border p-2 rounded" onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
          <input required placeholder="Mobile*" className="border p-2 rounded" onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          <input placeholder="Email" className="border p-2 rounded" onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input required placeholder="Address*" className="border p-2 rounded" onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input required placeholder="City*" className="border p-2 rounded" onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input placeholder="Pin" className="border p-2 rounded" onChange={(e) => setForm({ ...form, pin: e.target.value })} />
          <select className="border p-2 rounded" onChange={(e) => setForm({ ...form, source: e.target.value })}>{sources.map((s) => <option key={s} value={s}>{s}</option>)}</select>
          <select className="border p-2 rounded" onChange={(e) => setForm({ ...form, priority: e.target.value })}>{priorities.map((p) => <option key={p} value={p}>{p}</option>)}</select>
          <input required placeholder="Service Required*" className="border p-2 rounded" onChange={(e) => setForm({ ...form, service: e.target.value })} />
          <input type="date" placeholder="Preferred Date" className="border p-2 rounded" onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} />
          <textarea placeholder="Problem" className="border p-2 rounded md:col-span-2" onChange={(e) => setForm({ ...form, problem: e.target.value })} />
          <button type="submit" className="bg-green-600 text-white p-2 rounded md:col-span-4">Create Lead</button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Lead ID</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Service</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Assigned</th>
              <th className="p-3 text-left">Follow-up</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((l) => (
              <tr key={l._id} className="border-t">
                <td className="p-3">{l.leadId}</td>
                <td className="p-3">{l.customerName} <br /><span className="text-gray-500">{l.mobile}</span></td>
                <td className="p-3">{l.service}</td>
                <td className="p-3">
                  <select value={l.status} onChange={(e) => changeStatus(l._id, e.target.value)} className="border p-1 rounded">
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <select value={l.assignedStaff?._id || ""} onChange={(e) => assignLead(l._id, e.target.value)} className="border p-1 rounded">
                    <option value="">Assign</option>
                    {staff.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <input type="date" className="border p-1 rounded mb-1" value={l.followUpDate ? l.followUpDate.split("T")[0] : ""} onChange={(e) => updateFollowUp(l._id, e.target.value, l.followUpNote || "")} />
                  <input className="border p-1 rounded w-full text-xs" placeholder="Note" value={l.followUpNote || ""} onChange={(e) => updateFollowUp(l._id, l.followUpDate ? l.followUpDate.split("T")[0] : "", e.target.value)} />
                </td>
                <td className="p-3">
                  <button onClick={() => changeStatus(l._id, "closed")} className="text-green-600 hover:underline">Close</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
