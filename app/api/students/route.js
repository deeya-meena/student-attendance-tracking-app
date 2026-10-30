import { db } from "@/utils/postgres";
import { STUDENTS } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

// GET /api/students?grade=5th   OR   /api/students (all)
export async function GET(req) {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const grade = searchParams.get("grade");

  try {
    let students;
    if (grade) {
      students = await db
        .select()
        .from(STUDENTS)
        .where(eq(STUDENTS.grade, grade));
    } else {
      students = await db.select().from(STUDENTS);
    }
    return NextResponse.json({ data: students });
  } catch (err) {
    console.error("GET /api/students error:", err);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

// POST /api/students  — body: { name, grade, contact?, address? }
export async function POST(req) {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, grade, contact, address } = body;

    if (!name?.trim() || !grade?.trim()) {
      return NextResponse.json(
        { error: "Name and grade are required" },
        { status: 400 }
      );
    }

    const [student] = await db
      .insert(STUDENTS)
      .values({ name: name.trim(), grade: grade.trim(), contact, address })
      .returning();

    return NextResponse.json({ data: student }, { status: 201 });
  } catch (err) {
    console.error("POST /api/students error:", err);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
