"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function StaffDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get("/reports/dashboard").then((res) => setStats(res.data.data));
  }, []);

  const statusCards = (stats?.statuses || []).map((s: any) => ({
    label: s.label,
    value: stats?.statusData?.[s.name] ?? 0,
    bg: s.color || "#6B7280",
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Technician Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusCards.map((c: any) => (
          <div key={c.label} className="text-white p-5 rounded-xl shadow" style={{ backgroundColor: c.bg }}>
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-sm opacity-90">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
