"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import {
  Pencil,
  Trash2,
  UserPlus,
  Search,
  Users,
  AlertCircle,
} from "lucide-react";

const GRADES = ["5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

// ---------- AddEditStudentDialog ----------
function StudentDialog({ open, onOpenChange, student, onSaved }) {
  const isEdit = !!student;
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: student?.name ?? "",
      grade: student?.grade ?? GRADES[0],
      contact: student?.contact ?? "",
      address: student?.address ?? "",
    },
  });

  // Reset form values when student changes (open/close or switch edit target)
  useEffect(() => {
    reset({
      name: student?.name ?? "",
      grade: student?.grade ?? GRADES[0],
      contact: student?.contact ?? "",
      address: student?.address ?? "",
    });
    setServerError("");
  }, [student, reset, open]);

  const onSubmit = async (data) => {
    setSaving(true);
    setServerError("");
    try {
      const url = isEdit ? `/api/students/${student.id}` : "/api/students";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      onSaved(json.data, isEdit);
      onOpenChange(false);
    } catch (e) {
      setServerError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Student" : "Add New Student"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the student's information below."
              : "Fill in the details to enroll a new student."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {serverError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
              <AlertCircle className="size-4 shrink-0" />
              {serverError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Full Name <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. John Smith"
              {...register("name", { required: "Name is required" })}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Grade <span className="text-destructive">*</span>
            </label>
            <select
              className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              {...register("grade", { required: true })}
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Contact Number</label>
            <Input
              placeholder="e.g. 987-654-3210"
              {...register("contact")}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Address</label>
            <Input
              placeholder="e.g. 123 Main St, Springfield"
              {...register("address")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Update" : "Add Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------- DeleteConfirmDialog ----------
function DeleteDialog({ open, onOpenChange, student, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setError("");
    }
  }, [open]);

  const handleDelete = async () => {
    if (!student?.id) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete");
      onDeleted(student.id);
      onOpenChange(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Student</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove{" "}
            <strong>{student?.name}</strong> from the system? This will also
            delete all their attendance records. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Main Students Page ----------
export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");

  // Dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteStudent, setDeleteStudent] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/students");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load");
      setStudents(json.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSaved = (saved, isEdit) => {
    if (isEdit) {
      setStudents((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
    } else {
      setStudents((prev) => [...prev, saved]);
    }
  };

  const handleDeleted = (id) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  // Filter logic
  const filtered = students.filter((s) => {
    const matchesSearch = s.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesGrade =
      gradeFilter === "all" || s.grade === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  // Unique grades from actual student data for filter dropdown
  const availableGrades = [...new Set(students.map((s) => s.grade))].sort();

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Students</h2>
          <p className="text-sm text-muted-foreground">
            {students.length} student{students.length !== 1 ? "s" : ""} enrolled
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} suppressHydrationWarning className="shrink-0">
          <UserPlus className="size-4" />
          Add New Student
        </Button>
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            suppressHydrationWarning
            className="pl-8 bg-white border-slate-200"
          />
        </div>
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          suppressHydrationWarning
          className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#4845d2]/20"
        >
          <option value="all">All Grades</option>
          {availableGrades.map((g) => (
            <option key={g} value={g}>
              Grade {g}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center">
          <AlertCircle className="size-8 text-destructive mx-auto mb-2" />
          <p className="font-medium text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={fetchStudents}
          >
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Users className="size-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-muted-foreground">
            {students.length === 0
              ? "No students enrolled yet"
              : "No students match your search"}
          </p>
          {students.length === 0 && (
            <Button
              className="mt-4"
              onClick={() => setAddOpen(true)}
            >
              <UserPlus className="size-4" /> Add First Student
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="text-left py-3.5 px-5">Name</th>
                <th className="text-left py-3.5 px-5">Grade</th>
                <th className="text-left py-3.5 px-5 hidden sm:table-cell">
                  Contact
                </th>
                <th className="text-left py-3.5 px-5 hidden md:table-cell">
                  Address
                </th>
                <th className="text-right py-3.5 px-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((student, idx) => (
                <tr
                  key={student.id}
                  className={`transition-colors hover:bg-slate-50/70 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    }`}
                >
                  <td className="py-3 px-4 font-medium">{student.name}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                      {student.grade}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                    {student.contact || "—"}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground hidden md:table-cell max-w-[200px] truncate">
                    {student.address || "—"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setEditStudent(student)}
                        title="Edit student"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteStudent(student)}
                        title="Delete student"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialogs */}
      <StudentDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        student={null}
        onSaved={handleSaved}
      />
      <StudentDialog
        open={!!editStudent}
        onOpenChange={(o) => !o && setEditStudent(null)}
        student={editStudent}
        onSaved={handleSaved}
      />
      <DeleteDialog
        open={!!deleteStudent}
        onOpenChange={(o) => !o && setDeleteStudent(null)}
        student={deleteStudent}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
