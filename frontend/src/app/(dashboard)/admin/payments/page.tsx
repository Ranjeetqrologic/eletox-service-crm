"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<any>({ lead: "", amount: "", mode: "cash", status: "received", transactionId: "", notes: "" });
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
    fetchLeads();
  }, []);

  const fetchPayments = () => {
    api.get("/payments").then((res) => setPayments(res.data.data));
  };

  const fetchLeads = () => {
    api.get("/leads").then((res) => setLeads(res.data.data));
  };

  const filteredLeads = leads.filter((l) =>
    [l.customerName, l.mobile, l.leadId].some((x) => x?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/payments/${editing}`, form);
        toast.success("Payment updated");
      } else {
        await api.post("/payments", form);
        toast.success("Payment recorded");
      }
      setForm({ lead: "", amount: "", mode: "cash", status: "received", transactionId: "", notes: "" });
      setEditing(null);
      fetchPayments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const editPayment = (p: any) => {
    setEditing(p._id);
    setForm({
      lead: p.lead?._id || "",
      amount: p.amount,
      mode: p.mode,
      status: p.status,
      transactionId: p.transactionId || "",
      notes: p.notes || "",
    });
  };

  const deletePayment = async (id: string) => {
    if (!confirm("Delete this payment?")) return;
    try {
      await api.delete(`/payments/${id}`);
      toast.success("Payment deleted");
      fetchPayments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const totalReceived = payments.filter((p) => p.status === "received").reduce((sum, p) => sum + p.amount, 0);
  const totalAdvance = payments.filter((p) => p.status === "advance").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payments</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-500 text-white p-4 rounded-xl">Total Received: ₹{totalReceived}</div>
        <div className="bg-blue-500 text-white p-4 rounded-xl">Advance: ₹{totalAdvance}</div>
        <div className="bg-purple-500 text-white p-4 rounded-xl">Total: ₹{totalReceived + totalAdvance}</div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="font-semibold text-lg">{editing ? "Edit Payment" : "Record Payment"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <input className="border p-2 rounded w-full" placeholder="Search lead by name, mobile, or ID" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="border p-2 rounded" value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })} required>
            <option value="">Select Lead*</option>
            {filteredLeads.map((l) => <option key={l._id} value={l._id}>{l.customerName} ({l.leadId}) - {l.mobile}</option>)}
          </select>
          <input className="border p-2 rounded" type="number" placeholder="Amount*" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <select className="border p-2 rounded" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="online">Online</option>
          </select>
          <select className="border p-2 rounded" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="received">Received</option>
            <option value="advance">Advance</option>
            <option value="pending">Pending</option>
          </select>
          <input className="border p-2 rounded" placeholder="Transaction ID" value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div className="flex gap-2">
          <button className="bg-primary-600 text-white px-4 py-2 rounded">{editing ? "Update Payment" : "Record Payment"}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm({ lead: "", amount: "", mode: "cash", status: "received", transactionId: "", notes: "" }); }} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>}
        </div>
      </form>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Lead</th><th className="p-3 text-left">Amount</th><th className="p-3 text-left">Mode</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Txn ID</th><th className="p-3 text-left">Actions</th></tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="p-3">{p.lead?.customerName} ({p.lead?.leadId})</td>
                <td className="p-3">₹{p.amount}</td>
                <td className="p-3">{p.mode}</td>
                <td className="p-3">{p.status}</td>
                <td className="p-3">{p.transactionId || "-"}</td>
                <td className="p-3 space-x-2">
                  <button onClick={() => editPayment(p)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => deletePayment(p._id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
