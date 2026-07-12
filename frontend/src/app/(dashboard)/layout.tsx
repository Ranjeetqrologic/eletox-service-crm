"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Bars3Icon, XMarkIcon, HomeIcon, UsersIcon, ClipboardDocumentListIcon, CurrencyRupeeIcon, ChartPieIcon, CogIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!user && typeof window !== "undefined") {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  const isAdmin = user.role !== "technician";
  const nav = isAdmin
    ? [
        { name: "Dashboard", href: "/admin", icon: HomeIcon },
        { name: "Leads", href: "/admin/leads", icon: ClipboardDocumentListIcon },
        { name: "Staff", href: "/admin/staff", icon: UsersIcon },
        { name: "Payments", href: "/admin/payments", icon: CurrencyRupeeIcon },
        { name: "Reports", href: "/admin/reports", icon: ChartPieIcon },
        { name: "Settings", href: "/admin/settings", icon: CogIcon },
      ]
    : [
        { name: "Dashboard", href: "/staff", icon: HomeIcon },
        { name: "My Leads", href: "/staff/leads", icon: ClipboardDocumentListIcon },
        { name: "Attendance", href: "/staff/attendance", icon: UsersIcon },
      ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className={`bg-gray-900 text-white w-64 flex-shrink-0 ${sidebarOpen ? "block" : "hidden"} md:block`}>
        <div className="p-4 font-bold text-xl">ESCM</div>
        <nav className="mt-6 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm ${active ? "bg-primary-600" : "hover:bg-gray-800"}`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-800"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 flex items-center justify-between md:justify-end">
          <button className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
          <div className="text-sm font-medium">{user.name} <span className="text-gray-500">({user.role})</span></div>
        </header>
        <main className="p-6 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
