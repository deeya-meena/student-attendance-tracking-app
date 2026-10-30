"use client";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Hand,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import React from "react";

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
];

function SideNav() {
  const { user } = useKindeBrowserClient();
  const pathname = usePathname();

  return (
    <div className="border-r shadow-sm h-full flex flex-col bg-background">
      {/* Logo */}
      <div className="p-5 border-b">
        <Image src="/logo.svg" width={109} height={40} alt="logo" priority />
      </div>

      {/* Navigation links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuList.map((menu) => {
          const isActive =
            menu.path === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(menu.path);
          return (
            <Link href={menu.path} key={menu.id}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-150 text-sm font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <menu.icon className="size-4 shrink-0" />
                {menu.name}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Image
            src={user?.picture || "/logo.svg"}
            width={36}
            height={36}
            alt="user avatar"
            className="rounded-full border object-cover"
            unoptimized={!!user?.picture}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {user?.given_name} {user?.family_name}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <LogoutLink>
            <LogOut className="size-4 text-muted-foreground hover:text-destructive transition-colors cursor-pointer" />
          </LogoutLink>
        </div>
      </div>
    </div>
  );
}

export default SideNav;