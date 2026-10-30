import { db } from "@/utils/postgres";
import { ATTENDANCE, STUDENTS } from "@/utils/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

// GET /api/attendance?date=2024-10-30&grade=5th
export async function GET(req) {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const grade = searchParams.get("grade");

  try {
    const conditions = [];
    if (date) conditions.push(eq(ATTENDANCE.date, date));
    if (grade) conditions.push(eq(ATTENDANCE.grade, grade));

    const records =
      conditions.length > 0
        ? await db
            .select()
            .from(ATTENDANCE)
            .where(and(...conditions))
        : await db.select().from(ATTENDANCE);

    return NextResponse.json({ data: records });
  } catch (err) {
    console.error("GET /api/attendance error:", err);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

// POST /api/attendance
// Body: { date, grade, attendance: [{ studentId, present }] }
export async function POST(req) {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { date, grade, attendance } = body;

    if (!date || !grade || !Array.isArray(attendance)) {
      return NextResponse.json(
        { error: "date, grade and attendance array are required" },
        { status: 400 }
      );
    }

    // Delete existing records for this date+grade before re-inserting
    await db
      .delete(ATTENDANCE)
      .where(and(eq(ATTENDANCE.date, date), eq(ATTENDANCE.grade, grade)));

    if (attendance.length > 0) {
      await db.insert(ATTENDANCE).values(
        attendance.map(({ studentId, present }) => ({
          studentId,
          present,
          date,
          grade,
        }))
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/attendance error:", err);
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}
