"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function StaffDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get("/reports/dashboard").then((res) => setStats(res.data.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Technician Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Assigned", value: stats?.assigned ?? 0 },
          { label: "Working", value: stats?.working ?? 0 },
          { label: "Completed", value: stats?.completed ?? 0 },
          { label: "Pending", value: stats?.pending ?? 0 },
        ].map((c) => (
          <div key={c.label} className="bg-white p-5 rounded-xl shadow border">
            <div className="text-2xl font-bold text-primary-700">{c.value}</div>
            <div className="text-sm text-gray-500">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
