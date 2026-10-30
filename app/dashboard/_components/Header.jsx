"use client";
import React, { useState, useRef, useEffect } from "react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import Image from "next/image";
import { LogOut, Menu, X } from "lucide-react";
import SideNav from "./SideNav";

export default function Header() {
  const { user } = useKindeBrowserClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial =
    user?.given_name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "G";

  return (
    <>
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200/80 px-6 sm:px-8 h-16 flex items-center justify-between md:justify-end gap-4 shadow-2xs">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          suppressHydrationWarning
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="size-5" />
        </button>

        {/* User avatar on the far right matching reference */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            suppressHydrationWarning
            className="flex items-center gap-2 rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-[#4845d2]/40 transition cursor-pointer"
            aria-label="User profile menu"
          >
            {mounted && user?.picture ? (
              <Image
                src={user.picture}
                width={36}
                height={36}
                alt="user avatar"
                className="rounded-full border border-slate-200 object-cover"
                unoptimized
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#135d45] text-white flex items-center justify-center font-bold text-sm shadow-xs select-none">
                {mounted ? initial : "G"}
              </div>
            )}
          </button>

          {/* Profile & Logout Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg z-30 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {user?.given_name
                    ? `${user.given_name} ${user.family_name || ""}`
                    : "Account"}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {user?.email || "Signed in"}
                </p>
              </div>

              <div className="pt-1">
                <LogoutLink className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors w-full cursor-pointer">
                  <LogOut className="size-4" />
                  <span>Log out</span>
                </LogoutLink>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-[80%] h-full bg-white shadow-xl z-50 flex flex-col">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              suppressHydrationWarning
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
            <SideNav onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
