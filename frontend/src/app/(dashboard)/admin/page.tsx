"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const CUMULATIVE = ["new", "pending", "assigned", "accepted", "completed"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [cardCfg, setCardCfg] = useState<Record<string, boolean>>({});
  const router = useRouter();

  useEffect(() => {
    api.get("/reports/dashboard")
      .then((res) => setStats(res.data.data))
      .catch((err) => console.error("Dashboard fetch failed:", err));
    api.get("/settings/company").then((res) => setCardCfg(res.data.data?.adminDashboardCards || {})).catch(() => {});
  }, []);

  const statusCards = (stats?.statuses || [])
    .filter((s: any) => !CUMULATIVE.includes(s.name) && s.showOnAdminDashboard !== false)
    .map((s: any) => ({
      label: s.label,
      value: stats?.statusData?.[s.name] ?? 0,
      bg: s.color || "#6B7280",
      href: `/admin/leads/?status=${s.name}`,
    }));

  const statusShown = (name: string) => (stats?.statuses || []).find((s: any) => s.name === name)?.showOnAdminDashboard !== false;
  const leadCards = [
    { key: "new", label: "New Leads", value: stats?.newLeads ?? 0, bg: "#3B82F6", href: "/admin/leads/?view=new" },
    { key: "pending", label: "Pending Leads", value: stats?.pendingLeads ?? 0, bg: "#F59E0B", href: "/admin/leads/?view=pending" },
    { key: "assigned", label: "Assigned Leads", value: stats?.assignedLeads ?? 0, bg: "#EAB308", href: "/admin/leads/?view=assigned" },
    { key: "accepted", label: "Accepted Leads", value: stats?.acceptedLeads ?? 0, bg: "#0EA5E9", href: "/admin/leads/?view=accepted" },
    { key: "completed", label: "Completed Leads", value: stats?.completedLeads ?? 0, bg: "#22C55E", href: "/admin/leads/?view=completed" },
  ];

  const fixedCards = [
    { key: "totalLeads", label: "Total Leads", value: stats?.totalLeads ?? 0, bg: "#6366F1", href: "/admin/leads/" },
    { key: "todayLeads", label: "Today Leads", value: stats?.todayLeads ?? 0, bg: "#A855F7", href: "/admin/leads/?fromDate=today" },
  ];

  const cards = [...leadCards.filter((c) => statusShown(c.key)), ...statusCards, ...fixedCards.filter((c) => cardCfg[c.key] !== false)];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c: any) => (
          <button
            key={c.label}
            onClick={() => router.push(c.href)}
            className="text-white p-5 rounded-xl shadow text-left hover:opacity-90 transition"
            style={{ backgroundColor: c.bg }}
          >
            <div className="text-3xl font-bold">{c.value}</div>
            <div className="text-sm opacity-90">{c.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
