"use client";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { usePathname } from "next/navigation";
import Image from "next/image";
import React from "react";

function Header() {
  const { user } = useKindeBrowserClient();
  const pathname = usePathname();

  // Build a human-readable page title from the pathname
  const segments = pathname.split("/").filter(Boolean);
  const pageTitle =
    segments.length > 1
      ? segments[segments.length - 1].charAt(0).toUpperCase() +
        segments[segments.length - 1].slice(1)
      : "Dashboard";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <header className="sticky top-0 z-20 bg-background border-b px-6 py-3 flex items-center justify-between gap-4">
      <div>
        <p className="text-xs text-muted-foreground">{greeting}</p>
        <h1 className="text-xl font-bold tracking-tight">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium leading-none">
            {user?.given_name} {user?.family_name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
        </div>
        <Image
          src={user?.picture || "/logo.svg"}
          width={36}
          height={36}
          alt="user"
          className="rounded-full border object-cover"
          unoptimized={!!user?.picture}
        />
      </div>
    </header>
  );
}

export default Header;