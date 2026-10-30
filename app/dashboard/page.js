"use client";
import React, { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Calendar,
  GraduationCap,
} from "lucide-react";

function StatCard({ title, value, subtitle, icon: Icon, colorClass }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm flex items-start gap-4">
      <div className={`rounded-lg p-2.5 ${colorClass}`}>
        <Icon className="size-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-0.5">{value ?? "—"}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function AttendanceBar({ date, present, total }) {
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;
  const label = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const barColor =
    pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-16 shrink-0">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium w-10 text-right">{pct}%</span>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setStats(json.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-muted h-28" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center">
        <p className="text-destructive font-medium">Failed to load dashboard</p>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  const {
    totalStudents,
    presentCount,
    absentCount,
    attendancePercentage,
    studentsByGrade,
    recentAttendance,
  } = stats;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          colorClass="bg-blue-500"
        />
        <StatCard
          title="Present (all time)"
          value={presentCount}
          icon={UserCheck}
          colorClass="bg-emerald-500"
        />
        <StatCard
          title="Absent (all time)"
          value={absentCount}
          icon={UserX}
          colorClass="bg-red-500"
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendancePercentage}%`}
          subtitle="across all records"
          icon={TrendingUp}
          colorClass="bg-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Students by Grade */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="size-5 text-muted-foreground" />
            <h2 className="font-semibold">Students by Grade</h2>
          </div>
          {studentsByGrade.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No students enrolled yet.
            </p>
          ) : (
            <div className="space-y-3">
              {studentsByGrade.map(({ grade, count }) => {
                const pct = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
                return (
                  <div key={grade} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground w-10 shrink-0">
                      {grade}
                    </span>
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Attendance Trend */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="size-5 text-muted-foreground" />
            <h2 className="font-semibold">Recent Attendance (7 days)</h2>
          </div>
          {recentAttendance.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No attendance records yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentAttendance.map((row) => (
                <AttendanceBar key={row.date} {...row} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick tip */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-4 flex items-start gap-3">
        <TrendingUp className="size-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Use the <strong>Attendance</strong> page to mark daily attendance, and the{" "}
          <strong>Students</strong> page to manage your student roster.
        </p>
      </div>
    </div>
  );
}