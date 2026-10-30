"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  ChevronDown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import AttendanceChart from "./_components/AttendanceChart";
import MonthlyAttendanceChart from "./_components/MonthlyAttendanceChart";

const GRADES = ["5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-[#e8f2fc] rounded-2xl p-6 shadow-xs flex items-center gap-4 transition-transform duration-150 hover:translate-y-[-1px]">
      {/* Circular icon badge with white background */}
      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
        <Icon className="size-6 text-[#4845d2]" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-800 leading-none">
          {title}
        </h3>
        <p className="text-2xl font-bold text-slate-900 mt-2 leading-none">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters matching screenshot (May 2024 / 5th)
  // Format: "YYYY-MM"
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    // Default to current year-month or "2024-05" if prefer reference
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${yyyy}-${mm}`;
  });
  const [selectedGrade, setSelectedGrade] = useState("5th");

  // Format month for display e.g. "May 2024"
  const formattedMonth = (() => {
    if (!selectedMonth) return "Select Month";
    const [year, month] = selectedMonth.split("-");
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  })();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedGrade) params.append("grade", selectedGrade);
      if (selectedMonth) params.append("month", selectedMonth);

      const res = await fetch(`/api/dashboard?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to fetch dashboard data");
      }
      setStats(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedGrade, selectedMonth]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Derived real attendance percentages
  const totalStudents = stats?.totalStudents ?? 0;
  const totalRecords = stats?.totalRecords ?? 0;
  const presentCount = stats?.presentCount ?? 0;
  const absentCount = stats?.absentCount ?? 0;

  const presentPercentage =
    totalRecords > 0
      ? `${((presentCount / totalRecords) * 100).toFixed(1)}%`
      : "0%";

  const absentPercentage =
    totalRecords > 0
      ? `${((absentCount / totalRecords) * 100).toFixed(1)}%`
      : "0%";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 3. DASHBOARD HEADING AND FILTERS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Dashboard
        </h1>

        {/* Filters aligned to the upper-right */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Month selector with calendar icon */}
          <div className="relative">
            <label className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-xs cursor-pointer hover:bg-slate-50 transition-colors">
              <CalendarIcon className="size-4 text-slate-500 shrink-0" />
              <span suppressHydrationWarning>{formattedMonth}</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                suppressHydrationWarning
                className="sr-only"
              />
            </label>
          </div>

          {/* Grade dropdown matching "5th ∨" */}
          <div className="relative">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              suppressHydrationWarning
              className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-sm font-medium text-slate-700 shadow-xs outline-none cursor-pointer hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-[#4845d2]/20"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <ChevronDown className="size-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="size-5 shrink-0 text-red-500" />
          <div className="flex-1">
            <p className="font-semibold">Failed to load statistics</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-medium transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4. SUMMARY CARDS */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#e8f2fc]/60 rounded-2xl p-6 h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Student"
            value={totalStudents}
            icon={GraduationCap}
          />
          <StatCard
            title="Total Present"
            value={presentPercentage}
            icon={TrendingUp}
          />
          <StatCard
            title="Total Absent"
            value={absentPercentage}
            icon={TrendingDown}
          />
        </div>
      )}

      {/* 5 & 6. CHARTS SECTION (Attendance bar chart on left, Monthly Attendance donut on right) */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-6 h-80" />
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 h-80" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Large white card on the left titled "Attendance" */}
          <div className="lg:col-span-8">
            <AttendanceChart data={stats?.recentAttendance || []} />
          </div>

          {/* White card on the right titled "Monthly Attendance" */}
          <div className="lg:col-span-4">
            <MonthlyAttendanceChart
              presentCount={presentCount}
              absentCount={absentCount}
              totalRecords={totalRecords}
            />
          </div>
        </div>
      )}
    </div>
  );
}
