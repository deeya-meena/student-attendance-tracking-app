"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Save,
  AlertCircle,
  Users,
  Loader2,
} from "lucide-react";

const GRADES = ["5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

export default function AttendancePage() {
  const [date, setDate] = useState(getTodayString());
  const [grade, setGrade] = useState(GRADES[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // { studentId: boolean }
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // Load students for the selected grade
  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true);
    setError(null);
    try {
      const res = await fetch(`/api/students?grade=${encodeURIComponent(grade)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch students");
      setStudents(json.data);
    } catch (e) {
      setError(e.message);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, [grade]);

  // Load existing attendance for selected date + grade
  const fetchAttendance = useCallback(async () => {
    setLoadingAttendance(true);
    try {
      const res = await fetch(
        `/api/attendance?date=${encodeURIComponent(date)}&grade=${encodeURIComponent(grade)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch attendance");

      const map = {};
      for (const record of json.data) {
        map[record.studentId] = record.present;
      }
      setAttendance(map);
    } catch {
      setAttendance({});
    } finally {
      setLoadingAttendance(false);
    }
  }, [date, grade]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (students.length > 0) {
      fetchAttendance();
    }
  }, [fetchAttendance, students]);

  const toggle = (studentId) => {
    setSaved(false);
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const markAll = (present) => {
    setSaved(false);
    const next = {};
    students.forEach((s) => (next[s.id] = present));
    setAttendance(next);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const attendanceArray = students.map((s) => ({
        studentId: s.id,
        present: attendance[s.id] ?? false,
      }));

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, grade, attendance: attendanceArray }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter((s) => attendance[s.id] === true).length;
  const absentCount = students.filter((s) => attendance[s.id] !== true).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Attendance</h1>
        <p className="text-sm text-slate-500 mt-1">
          Mark attendance for a specific date and grade.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1">
          <CalendarDays className="size-4 text-slate-500 shrink-0" />
          <Input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSaved(false);
            }}
            suppressHydrationWarning
            className="max-w-[200px] bg-white border-slate-200 text-slate-800 shadow-xs"
          />
        </div>
        <select
          value={grade}
          onChange={(e) => {
            setGrade(e.target.value);
            setSaved(false);
          }}
          suppressHydrationWarning
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs outline-none focus:ring-2 focus:ring-[#4845d2]/20"
        >
          {GRADES.map((g) => (
            <option key={g} value={g}>
              Grade {g}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3.5">
          <AlertCircle className="size-4 shrink-0 text-red-500" />
          {error}
        </div>
      )}

      {loadingStudents ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <Users className="size-10 text-slate-400 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">
            No students in Grade {grade}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Go to the Students page to enroll students.
          </p>
        </div>
      ) : (
        <>
          {/* Summary + bulk actions (Clean pure white container) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-slate-800">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span className="text-sm font-medium text-slate-700">
                  <strong className="text-emerald-600 font-bold">{presentCount}</strong> Present
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="size-4 text-red-500" />
                <span className="text-sm font-medium text-slate-700">
                  <strong className="text-red-600 font-bold">{absentCount}</strong> Absent
                </span>
              </div>
              {students.length > 0 && (
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  {Math.round((presentCount / students.length) * 100)}% present
                </span>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAll(true)}
                suppressHydrationWarning
                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs text-xs font-medium"
              >
                Mark All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAll(false)}
                suppressHydrationWarning
                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs text-xs font-medium"
              >
                Mark All Absent
              </Button>
            </div>
          </div>

          {/* Student list (Clean white table) */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            {loadingAttendance && (
              <div className="flex items-center justify-center py-4 gap-2 text-sm text-slate-500 border-b border-slate-100 bg-slate-50/50">
                <Loader2 className="size-3.5 animate-spin" />
                Loading saved attendance…
              </div>
            )}
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                  <th className="text-left py-3.5 px-5">Student</th>
                  <th className="text-center py-3.5 px-5">Status</th>
                  <th className="text-center py-3.5 px-5">Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student, idx) => {
                  const isPresent = attendance[student.id] === true;
                  return (
                    <tr
                      key={student.id}
                      className={`transition-colors cursor-pointer hover:bg-slate-50/70 ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      }`}
                      onClick={() => toggle(student.id)}
                    >
                      <td className="py-3.5 px-5 font-medium text-slate-800">{student.name}</td>
                      <td className="py-3.5 px-5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                            isPresent
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {isPresent ? (
                            <CheckCircle2 className="size-3" />
                          ) : (
                            <XCircle className="size-3" />
                          )}
                          {isPresent ? "Present" : "Absent"}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(student.id);
                          }}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4845d2]/40 ${
                            isPresent ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                          aria-label={`Toggle attendance for ${student.name}`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                              isPresent ? "translate-x-4" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Save button */}
          <div className="flex items-center justify-between pt-2">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="size-4" />
                Attendance saved successfully!
              </span>
            )}
            {!saved && <span />}
            <Button
              onClick={handleSave}
              disabled={saving || students.length === 0}
              suppressHydrationWarning
              className="gap-2 bg-[#4845d2] hover:bg-[#3f3cb8] text-white font-medium shadow-xs"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {saving ? "Saving…" : "Save Attendance"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
