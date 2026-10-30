"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Hand,
  Settings,
} from "lucide-react";

const menuList = [
  {
    id: 1,
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    id: 2,
    name: "Students",
    icon: GraduationCap,
    path: "/dashboard/students",
  },
  {
    id: 3,
    name: "Attendance",
    icon: Hand,
    path: "/dashboard/attendance",
  },
  {
    id: 4,
    name: "Settings",
    icon: Settings,
    path: "/dashboard/settings",
  },
];

export default function SideNav({ onCloseMobile }) {
  const pathname = usePathname();

  return (
    <aside className="border-r border-slate-200/80 h-full flex flex-col bg-white">
      {/* App Logo */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        {/* Robot face mark from screenshot */}
        <div className="w-10 h-10 rounded-xl bg-[#4845d2] flex items-center justify-center shrink-0 shadow-xs">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="2" y="5" width="20" height="14" rx="5" fill="white" />
            <circle cx="8" cy="12" r="2.2" fill="#4845d2" />
            <circle cx="16" cy="12" r="2.2" fill="#4845d2" />
            <circle cx="8" cy="12" r="0.9" fill="white" />
            <circle cx="16" cy="12" r="0.9" fill="white" />
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight text-[#0f172a]">
          Logoipsum
        </span>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuList.map((menu) => {
          const isActive =
            menu.path === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(menu.path);
          return (
            <Link
              href={menu.path}
              key={menu.id}
              onClick={() => onCloseMobile?.()}
            >
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-150 text-sm font-medium ${
                  isActive
                    ? "bg-[#4845d2] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <menu.icon
                  className={`size-5 shrink-0 ${
                    isActive ? "text-white" : "text-slate-500"
                  }`}
                />
                <span>{menu.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
