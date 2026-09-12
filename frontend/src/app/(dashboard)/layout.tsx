"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Logo from "@/components/Logo";
import api from "@/lib/api";
import { isAdminRole } from "@/lib/utils";
import {
  Bars3Icon, XMarkIcon, HomeIcon, UsersIcon, ClipboardDocumentListIcon, CurrencyRupeeIcon, ChartPieIcon,
  CogIcon, ArrowRightOnRectangleIcon, WrenchIcon, PhotoIcon, TagIcon, ShieldCheckIcon, RectangleGroupIcon,
  GlobeAltIcon, UserCircleIcon,
} from "@heroicons/react/24/outline";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [company, setCompany] = useState<any>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.replace("/login/");
    } else if (!isAdminRole(user.role) && pathname?.startsWith("/admin")) {
      router.replace("/staff/");
    }
    api.get("/settings/company").then((res) => setCompany(res.data.data || {})).catch(() => setCompany({}));
  }, [mounted, user, router, pathname]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!mounted || !user) return null;

  const isAdmin = isAdminRole(user.role);
  const nav = isAdmin
    ? [
        { name: "Dashboard", href: "/admin/", icon: HomeIcon },
        { name: "Leads", href: "/admin/leads/", icon: ClipboardDocumentListIcon },
        { name: "Lead Status", href: "/admin/lead-status/", icon: TagIcon },
        { name: "Staff", href: "/admin/staff/", icon: UsersIcon },
        { name: "Roles", href: "/admin/roles/", icon: ShieldCheckIcon },
        { name: "Services", href: "/admin/services/", icon: WrenchIcon },
        { name: "Banners", href: "/admin/banners/", icon: RectangleGroupIcon },
        { name: "Gallery", href: "/admin/gallery/", icon: PhotoIcon },
        { name: "Payments", href: "/admin/payments/", icon: CurrencyRupeeIcon },
        { name: "Reports", href: "/admin/reports/", icon: ChartPieIcon },
        { name: "Settings", href: "/admin/settings/", icon: CogIcon },
      ]
    : [
        { name: "Dashboard", href: "/staff/", icon: HomeIcon },
        { name: "My Leads", href: "/staff/leads/", icon: ClipboardDocumentListIcon },
      ];

  const current = nav.find((n) => n.href === pathname);
  const home = isAdmin ? "/admin/" : "/staff/";

  return (
    <div className="crm min-h-screen bg-gray-100 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={`bg-brand-dark text-white w-64 flex-shrink-0 flex flex-col fixed inset-y-0 left-0 z-40 transform transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-white/10">
          <Link href={home} className="flex items-center gap-3">
            <div className="bg-white rounded-lg p-1.5">
              <Logo showText={false} height={40} logoUrl={company.logo} />
            </div>
            <div>
              <div className="font-bold text-base leading-tight">{company.name || "Eletox"}</div>
              <div className="text-xs text-white/60">Service CRM</div>
            </div>
          </Link>
        </div>
        <nav className="mt-4 px-3 space-y-1 flex-1 overflow-y-auto">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  active ? "bg-primary-600 text-white shadow" : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white">
            <GlobeAltIcon className="w-5 h-5" />
            View Website
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/80 hover:bg-red-600 hover:text-white transition"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 h-16 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-gray-600" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
              {sidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
            <div className="text-sm text-gray-500 hidden sm:block">
              {isAdmin ? "Admin Panel" : "Staff Panel"}
              {current && <span className="text-gray-400"> / </span>}
              {current && <span className="text-gray-800 font-medium">{current.name}</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <div className="text-sm font-semibold text-gray-800">{user.name}</div>
              <div className="text-xs text-gray-500 capitalize">{user.role}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
              <UserCircleIcon className="w-7 h-7" />
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
