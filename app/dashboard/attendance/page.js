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
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold">Attendance</h2>
        <p className="text-sm text-muted-foreground">
          Mark attendance for a specific date and grade.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1">
          <CalendarDays className="size-4 text-muted-foreground shrink-0" />
          <Input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSaved(false);
            }}
            className="max-w-[200px]"
          />
        </div>
        <select
          value={grade}
          onChange={(e) => {
            setGrade(e.target.value);
            setSaved(false);
          }}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {GRADES.map((g) => (
            <option key={g} value={g}>
              Grade {g}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {loadingStudents ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-muted" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Users className="size-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-muted-foreground">
            No students in Grade {grade}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Go to the Students page to enroll students.
          </p>
        </div>
      ) : (
        <>
          {/* Summary + bulk actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border bg-card p-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span className="text-sm">
                  <strong className="text-emerald-600">{presentCount}</strong> Present
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="size-4 text-red-500" />
                <span className="text-sm">
                  <strong className="text-red-600">{absentCount}</strong> Absent
                </span>
              </div>
              {students.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {Math.round((presentCount / students.length) * 100)}% present
                </span>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAll(true)}
              >
                Mark All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAll(false)}
              >
                Mark All Absent
              </Button>
            </div>
          </div>

          {/* Student list */}
          <div className="rounded-xl border overflow-hidden shadow-sm">
            {loadingAttendance && (
              <div className="flex items-center justify-center py-4 gap-2 text-sm text-muted-foreground border-b bg-muted/30">
                <Loader2 className="size-3.5 animate-spin" />
                Loading saved attendance…
              </div>
            )}
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left font-semibold py-3 px-4">Student</th>
                  <th className="text-center font-semibold py-3 px-4">Status</th>
                  <th className="text-center font-semibold py-3 px-4">Toggle</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  const isPresent = attendance[student.id] === true;
                  return (
                    <tr
                      key={student.id}
                      className={`border-b last:border-0 transition-colors cursor-pointer hover:bg-muted/20 ${
                        idx % 2 === 0 ? "" : "bg-muted/10"
                      }`}
                      onClick={() => toggle(student.id)}
                    >
                      <td className="py-3 px-4 font-medium">{student.name}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isPresent
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
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
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(student.id);
                          }}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            isPresent ? "bg-emerald-500" : "bg-muted-foreground/30"
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
          <div className="flex items-center justify-between">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                <CheckCircle2 className="size-4" />
                Attendance saved successfully!
              </span>
            )}
            {!saved && <span />}
            <Button
              onClick={handleSave}
              disabled={saving || students.length === 0}
              className="gap-2"
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
