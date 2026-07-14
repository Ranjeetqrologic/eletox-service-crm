"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ lead: "", amount: "", mode: "cash", status: "received", transactionId: "", notes: "" });

  useEffect(() => {
    fetchPayments();
    api.get("/leads?status=completed,closed,working,assigned").then((res) => setLeads(res.data.data));
  }, []);

  const fetchPayments = () => {
    api.get("/payments").then((res) => setPayments(res.data.data));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/payments", form);
      toast.success("Payment recorded");
      setForm({ lead: "", amount: "", mode: "cash", status: "received", transactionId: "", notes: "" });
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
        <h2 className="font-semibold text-lg">Record Payment</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select className="border p-2 rounded" value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })} required>
            <option value="">Select Lead*</option>
            {leads.map((l) => <option key={l._id} value={l._id}>{l.customerName} ({l.leadId})</option>)}
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
        <button className="bg-primary-600 text-white px-4 py-2 rounded">Record Payment</button>
      </form>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Lead</th><th className="p-3 text-left">Amount</th><th className="p-3 text-left">Mode</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Txn ID</th></tr>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
