"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function StaffDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get("/reports/dashboard").then((res) => setStats(res.data.data));
  }, []);

  const statusCards = (stats?.statuses || []).filter((s: any) => s.showOnStaffDashboard !== false).map((s: any) => ({
    label: s.label,
    status: s.name === "new" ? "assigned" : s.name,
    value: stats?.statusData?.[s.name] ?? 0,
    bg: s.color || "#6B7280",
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Staff Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a href="/staff/leads/" className="block text-white p-5 rounded-xl shadow hover:opacity-90 hover:-translate-y-0.5 transition bg-brand-navy" style={{ backgroundColor: "#1e3a5f" }}>
          <div className="text-2xl font-bold">{stats?.totalLeads ?? 0}</div>
          <div className="text-sm opacity-90">My Leads (Total)</div>
        </a>
        {statusCards.map((c: any) => (
          <a key={c.label} href={`/staff/leads/?status=${encodeURIComponent(c.status)}`} className="block text-white p-5 rounded-xl shadow hover:opacity-90 hover:-translate-y-0.5 transition" style={{ backgroundColor: c.bg }}>
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-sm opacity-90">{c.label}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
