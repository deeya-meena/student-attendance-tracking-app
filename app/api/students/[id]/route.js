import { db } from "@/utils/postgres";
import { STUDENTS } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

// PUT /api/students/[id]
export async function PUT(req, { params }) {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
    }

    const body = await req.json();
    const { name, grade, contact, address } = body;

    if (!name?.trim() || !grade?.trim()) {
      return NextResponse.json(
        { error: "Name and grade are required" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(STUDENTS)
      .set({ name: name.trim(), grade: grade.trim(), contact, address })
      .where(eq(STUDENTS.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("PUT /api/students/[id] error:", err);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

// DELETE /api/students/[id]
export async function DELETE(req, { params }) {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(STUDENTS)
      .where(eq(STUDENTS.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ data: deleted });
  } catch (err) {
    console.error("DELETE /api/students/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
