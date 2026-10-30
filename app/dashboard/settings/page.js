"use client";
import React from "react";
import { Settings as SettingsIcon, Bell, Shield, User } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your student tracking application preferences.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs divide-y divide-slate-100">
        <div className="flex items-start gap-4 pb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <User className="size-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-slate-800">
              Account Profile
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Your account is authenticated via Kinde Authentication.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 py-6">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Bell className="size-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-slate-800">
              Notifications
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Attendance alerts and summary reports are enabled.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 pt-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Shield className="size-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-slate-800">
              Database & Security
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Connected securely to Neon Serverless PostgreSQL with Drizzle ORM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

