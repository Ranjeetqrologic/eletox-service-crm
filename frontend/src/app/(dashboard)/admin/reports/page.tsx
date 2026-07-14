"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function ReportsPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [staffPerf, setStaffPerf] = useState<any[]>([]);
  const [leadSource, setLeadSource] = useState<any[]>([]);
  const [serviceReport, setServiceReport] = useState<any[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<any>(null);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchData = () => {
    const query = from && to ? `?from=${from}&to=${to}` : "";
    api.get(`/reports/dashboard${query}`).then((res) => setDashboard(res.data.data));
    api.get(`/reports/staff-performance${query}`).then((res) => setStaffPerf(res.data.data));
    api.get(`/reports/lead-source${query}`).then((res) => setLeadSource(res.data.data));
    api.get(`/reports/service-report${query}`).then((res) => setServiceReport(res.data.data));
    api.get(`/reports/payment-summary${query}`).then((res) => setPaymentSummary(res.data.data));
    api.get("/reports/pending-payments").then((res) => setPendingPayments(res.data.data));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Leads", dashboard?.totalLeads],
      ["New", dashboard?.newLeads],
      ["Assigned", dashboard?.assigned],
      ["Working", dashboard?.working],
      ["Completed", dashboard?.completed],
      ["Cancelled", dashboard?.cancelled],
      ["Revenue", dashboard?.revenue],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-2">
          <input type="date" className="border p-2 rounded" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" className="border p-2 rounded" value={to} onChange={(e) => setTo(e.target.value)} />
          <button onClick={fetchData} className="bg-primary-600 text-white px-4 py-2 rounded">Filter</button>
          <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded">Export CSV</button>
        </div>
      </div>

      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Leads", value: dashboard.totalLeads, color: "bg-blue-500" },
            { label: "New", value: dashboard.newLeads, color: "bg-gray-500" },
            { label: "Assigned", value: dashboard.assigned, color: "bg-yellow-500" },
            { label: "Working", value: dashboard.working, color: "bg-orange-500" },
            { label: "Completed", value: dashboard.completed, color: "bg-green-500" },
            { label: "Cancelled", value: dashboard.cancelled, color: "bg-red-500" },
            { label: "Today Leads", value: dashboard.todayLeads, color: "bg-purple-500" },
            { label: "Revenue", value: `₹${dashboard.revenue}`, color: "bg-teal-500" },
          ].map((c) => (
            <div key={c.label} className={`${c.color} text-white p-4 rounded-xl shadow`}>
              <div className="text-2xl font-bold">{c.value}</div>
              <div className="text-sm opacity-90">{c.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Staff Performance</h2>
          <table className="w-full text-sm">
            <thead className="bg-gray-100"><tr><th className="p-2 text-left">Staff</th><th className="p-2 text-left">Assigned</th><th className="p-2 text-left">Completed</th><th className="p-2 text-left">Cancelled</th></tr></thead>
            <tbody>
              {staffPerf.map((s) => (
                <tr key={s.staffId} className="border-t"><td className="p-2">{s.name}</td><td className="p-2">{s.assigned}</td><td className="p-2">{s.completed}</td><td className="p-2">{s.cancelled}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Payment Summary</h2>
          {paymentSummary && (
            <div className="space-y-2">
              <p><strong>Total:</strong> ₹{paymentSummary.total}</p>
              <p><strong>By Mode:</strong> {paymentSummary.byMode?.map((m: any) => `${m._id}: ₹${m.amount}`).join(", ")}</p>
              <p><strong>By Status:</strong> {paymentSummary.byStatus?.map((m: any) => `${m._id}: ₹${m.amount}`).join(", ")}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Lead Source</h2>
          <table className="w-full text-sm">
            <thead className="bg-gray-100"><tr><th className="p-2 text-left">Source</th><th className="p-2 text-left">Count</th></tr></thead>
            <tbody>
              {leadSource.map((s) => <tr key={s._id} className="border-t"><td className="p-2">{s._id}</td><td className="p-2">{s.count}</td></tr>)}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Service Report</h2>
          <table className="w-full text-sm">
            <thead className="bg-gray-100"><tr><th className="p-2 text-left">Service</th><th className="p-2 text-left">Count</th></tr></thead>
            <tbody>
              {serviceReport.map((s) => <tr key={s._id} className="border-t"><td className="p-2">{s._id}</td><td className="p-2">{s.count}</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-semibold mb-3">Pending Payments</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-100"><tr><th className="p-2 text-left">Lead</th><th className="p-2 text-left">Staff</th><th className="p-2 text-left">Bill</th><th className="p-2 text-left">Received</th><th className="p-2 text-left">Pending</th></tr></thead>
          <tbody>
            {pendingPayments.map((j) => (
              <tr key={j._id} className="border-t">
                <td className="p-2">{j.lead?.customerName} ({j.lead?.leadId})</td>
                <td className="p-2">{j.staff?.name}</td>
                <td className="p-2">₹{j.billAmount}</td>
                <td className="p-2">₹{j.receivedAmount}</td>
                <td className="p-2 text-red-600">₹{j.pendingAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
