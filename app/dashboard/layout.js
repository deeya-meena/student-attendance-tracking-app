import React from "react";
import SideNav from "./_components/SideNav";
import Header from "./_components/Header";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800">
      {/* Fixed sidebar — visible md+ */}
      <div className="md:w-64 fixed inset-y-0 left-0 hidden md:block z-30">
        <SideNav />
      </div>

      {/* Main content area */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
