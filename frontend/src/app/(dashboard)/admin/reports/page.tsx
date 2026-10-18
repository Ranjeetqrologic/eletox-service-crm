"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [staffPerf, setStaffPerf] = useState<any[]>([]);
  const [leadSource, setLeadSource] = useState<any[]>([]);
  const [serviceReport, setServiceReport] = useState<any[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<any>(null);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchData = (f: string = from, t: string = to) => {
    const params = new URLSearchParams();
    if (f) params.set("from", f);
    if (t) params.set("to", t);
    const query = params.toString() ? `?${params.toString()}` : "";
    api.get(`/reports/dashboard${query}`).then((res) => setDashboard(res.data.data));
    api.get(`/reports/staff-performance${query}`).then((res) => setStaffPerf(res.data.data));
    api.get(`/reports/lead-source${query}`).then((res) => setLeadSource(res.data.data));
    api.get(`/reports/service-report${query}`).then((res) => setServiceReport(res.data.data));
    api.get(`/reports/payment-summary${query}`).then((res) => setPaymentSummary(res.data.data));
    api.get(`/reports/pending-payments${query}`).then((res) => setPendingPayments(res.data.data));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const cum: Record<string, number> = {
    new: dashboard?.newLeads ?? 0,
    pending: dashboard?.pendingLeads ?? 0,
    assigned: dashboard?.assignedLeads ?? 0,
    accepted: dashboard?.acceptedLeads ?? 0,
    completed: dashboard?.completedLeads ?? 0,
  };
  const statusCards = (dashboard?.statuses || [])
    .filter((s: any) => s.showOnAdminDashboard !== false)
    .map((s: any) => ({
      label: s.label,
      value: cum[s.name] ?? dashboard?.statusData?.[s.name] ?? 0,
      bg: s.color || "#6B7280",
    }));

  const periodLabel = from || to ? `${from || "start"} to ${to || "today"}` : "All Time";

  const summaryRows = (): (string | number)[][] => [
    ["Total Leads", dashboard?.totalLeads ?? 0],
    ...statusCards.map((c: any) => [c.label, c.value]),
    ["Today Leads", dashboard?.todayLeads ?? 0],
    ["Total Bill", paymentSummary?.bill ?? 0],
    ["Received", paymentSummary?.received ?? 0],
    ["Pending Amount", paymentSummary?.pending ?? 0],
  ];
  const staffHead = ["Staff", "Assigned", "Accepted", "Completed", "Closed", "Cancelled", "Bill", "Received", "Pending"];
  const staffRows = () => staffPerf.map((s) => [s.name, s.assigned, s.accepted, s.completed, s.closed, s.cancelled, s.bill, s.received, s.pending]);
  const sourceRows = () => leadSource.map((s) => [s._id || "-", s.count]);
  const serviceRows = () => serviceReport.map((s) => [s._id || "-", s.count]);
  const pendingHead = ["Lead", "Customer", "Mobile", "Staff", "Bill", "Received", "Pending"];
  const pendingRows = () => pendingPayments.map((j) => [j.lead?.leadId || "", j.lead?.customerName || "", j.lead?.mobile || "", j.staff?.name || "", j.billAmount, j.receivedAmount, j.pendingAmount]);
  const fileBase = `eletox-report-${from || to ? `${from || "start"}_${to || "today"}` : new Date().toLocaleDateString("en-CA")}`;

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Eletox Report", periodLabel], [], ["Metric", "Value"], ...summaryRows()]), "Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([staffHead, ...staffRows()]), "Staff Performance");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Source", "Count"], ...sourceRows()]), "Lead Source");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Service", "Count"], ...serviceRows()]), "Services");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([pendingHead, ...pendingRows()]), "Pending Payments");
    XLSX.writeFile(wb, `${fileBase}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Eletox Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Period: ${periodLabel}    Generated: ${new Date().toLocaleString()}`, 14, 21);
    const section = (title: string, head: string[], body: (string | number)[][]) => {
      const y = ((doc as any).lastAutoTable?.finalY || 24) + 8;
      doc.setFontSize(12);
      doc.text(title, 14, y);
      autoTable(doc, { startY: y + 2, head: [head], body: body.length ? body.map((r) => r.map(String)) : [["-"]], styles: { fontSize: 8 }, headStyles: { fillColor: [37, 99, 235] } });
    };
    section("Summary", ["Metric", "Value"], summaryRows());
    section("Staff Performance", staffHead, staffRows());
    section("Lead Source", ["Source", "Count"], sourceRows());
    section("Service Report", ["Service", "Count"], serviceRows());
    section("Pending Payments", pendingHead, pendingRows());
    doc.save(`${fileBase}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Reports <span className="text-sm font-normal text-gray-500">({periodLabel})</span></h1>
        <div className="flex flex-wrap gap-2">
          <input type="date" className="border p-2 rounded" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" className="border p-2 rounded" value={to} onChange={(e) => setTo(e.target.value)} />
          <button onClick={() => fetchData()} className="bg-primary-600 text-white px-4 py-2 rounded">Filter</button>
          {(from || to) && <button onClick={() => { setFrom(""); setTo(""); fetchData("", ""); }} className="bg-gray-300 px-4 py-2 rounded">Clear</button>}
          <button onClick={exportExcel} className="bg-green-600 text-white px-4 py-2 rounded">Export Excel</button>
          <button onClick={exportPDF} className="bg-red-600 text-white px-4 py-2 rounded">Export PDF</button>
        </div>
      </div>

      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Leads", value: dashboard.totalLeads, bg: "#3B82F6" },
            ...statusCards,
            { label: from || to ? "Leads in Period" : "Today Leads", value: dashboard.todayLeads, bg: "#A855F7" },
            { label: "Total Bill", value: `₹${paymentSummary?.bill ?? 0}`, bg: "#8B5CF6" },
            { label: "Received", value: `₹${paymentSummary?.received ?? 0}`, bg: "#22C55E" },
            { label: "Pending Amount", value: `₹${paymentSummary?.pending ?? 0}`, bg: "#F97316" },
          ].map((c: any) => (
            <div key={c.label} className="text-white p-4 rounded-xl shadow" style={{ backgroundColor: c.bg }}>
              <div className="text-2xl font-bold">{c.value}</div>
              <div className="text-sm opacity-90">{c.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-xl shadow overflow-x-auto lg:col-span-2">
          <h2 className="font-semibold mb-3">Staff Performance</h2>
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-100"><tr><th className="p-2 text-left">Staff</th><th className="p-2 text-left">Assigned</th><th className="p-2 text-left">Accepted</th><th className="p-2 text-left">Completed</th><th className="p-2 text-left">Closed</th><th className="p-2 text-left">Cancelled</th><th className="p-2 text-right">Bill</th><th className="p-2 text-right">Received</th><th className="p-2 text-right">Pending</th></tr></thead>
            <tbody>
              {staffPerf.length === 0 && <tr><td colSpan={9} className="p-3 text-center text-gray-500">No staff</td></tr>}
              {staffPerf.map((s) => (
                <tr key={s.name} className="border-t"><td className="p-2">{s.name}</td><td className="p-2">{s.assigned}</td><td className="p-2">{s.accepted}</td><td className="p-2">{s.completed}</td><td className="p-2">{s.closed}</td><td className="p-2">{s.cancelled}</td><td className="p-2 text-right">₹{s.bill}</td><td className="p-2 text-right text-green-700">₹{s.received}</td><td className="p-2 text-right text-orange-700">₹{s.pending}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Payment Summary</h2>
          {paymentSummary && (
            <div className="space-y-2">
              <p><strong>Total Bill:</strong> ₹{paymentSummary.bill}</p>
              <p><strong>Received (Aaya):</strong> <span className="text-green-700">₹{paymentSummary.received}</span></p>
              <p><strong>Pending:</strong> <span className="text-orange-700">₹{paymentSummary.pending}</span></p>
              <p><strong>By Mode:</strong> {paymentSummary.byMode?.length ? paymentSummary.byMode.map((m: any) => `${m._id}: ₹${m.amount}`).join(", ") : "-"}</p>
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
            {pendingPayments.length === 0 && <tr><td colSpan={5} className="p-3 text-center text-gray-500">No pending payments</td></tr>}
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
