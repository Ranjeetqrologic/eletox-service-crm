"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get("/reports/dashboard")
      .then((res) => setStats(res.data.data))
      .catch((err) => console.error("Dashboard fetch failed:", err));
  }, []);

  const cards = [
    { label: "Total Leads", value: stats?.totalLeads ?? 0, color: "bg-blue-500" },
    { label: "New", value: stats?.newLeads ?? 0, color: "bg-gray-500" },
    { label: "Assigned", value: stats?.assigned ?? 0, color: "bg-yellow-500" },
    { label: "Working", value: stats?.working ?? 0, color: "bg-orange-500" },
    { label: "Completed", value: stats?.completed ?? 0, color: "bg-green-500" },
    { label: "Half Done", value: stats?.halfDone ?? 0, color: "bg-orange-500" },
    { label: "Cancelled", value: stats?.cancelled ?? 0, color: "bg-red-500" },
    { label: "Today Leads", value: stats?.todayLeads ?? 0, color: "bg-purple-500" },
    { label: "Revenue", value: `₹${stats?.revenue ?? 0}`, color: "bg-teal-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`${c.color} text-white p-5 rounded-xl shadow`}>
            <div className="text-3xl font-bold">{c.value}</div>
            <div className="text-sm opacity-90">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
