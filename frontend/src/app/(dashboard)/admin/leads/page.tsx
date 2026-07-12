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

  const fetchLeads = () => api.get("/leads").then((res) => setLeads(res.data.data));
  const fetchStaff = () => api.get("/staff/technicians").then((res) => setStaff(res.data.data));

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lead Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-primary-600 text-white px-4 py-2 rounded">
          {showForm ? "Close" : "+ New Lead"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 grid md:grid-cols-3 gap-4">
          <input required name="customerName" placeholder="Customer Name" className="border p-2 rounded" onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
          <input required name="mobile" placeholder="Mobile" className="border p-2 rounded" onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          <input name="email" placeholder="Email" className="border p-2 rounded" onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input required name="address" placeholder="Address" className="border p-2 rounded" onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input required name="city" placeholder="City" className="border p-2 rounded" onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input name="pin" placeholder="Pin" className="border p-2 rounded" onChange={(e) => setForm({ ...form, pin: e.target.value })} />
          <select className="border p-2 rounded" onChange={(e) => setForm({ ...form, source: e.target.value })}>
            {sources.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="border p-2 rounded" onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <input name="service" placeholder="Service Required" className="border p-2 rounded" onChange={(e) => setForm({ ...form, service: e.target.value })} required />
          <textarea name="problem" placeholder="Problem" className="border p-2 rounded md:col-span-2" onChange={(e) => setForm({ ...form, problem: e.target.value })} />
          <button type="submit" className="bg-green-600 text-white p-2 rounded md:col-span-3">Create Lead</button>
        </form>
      )}

      <div className="bg-white rounded shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Lead ID</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Service</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Assigned</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
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
                  <select
                    value={l.assignedStaff?._id || ""}
                    onChange={(e) => assignLead(l._id, e.target.value)}
                    className="border p-1 rounded"
                  >
                    <option value="">Assign</option>
                    {staff.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
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
