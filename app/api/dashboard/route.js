import { db } from "@/utils/postgres";
import { ATTENDANCE, STUDENTS } from "@/utils/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

// GET /api/dashboard  — returns statistics for the dashboard
export async function GET(req) {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Total students
    const [{ count: totalStudents }] = await db
      .select({ count: sql`count(*)::int` })
      .from(STUDENTS);

    // Total attendance records
    const [{ count: totalRecords }] = await db
      .select({ count: sql`count(*)::int` })
      .from(ATTENDANCE);

    // Present count
    const [{ count: presentCount }] = await db
      .select({ count: sql`count(*)::int` })
      .from(ATTENDANCE)
      .where(eq(ATTENDANCE.present, true));

    // Attendance percentage
    const attendancePercentage =
      totalRecords > 0
        ? Math.round((presentCount / totalRecords) * 100)
        : 0;

    // Students by grade
    const studentsByGrade = await db
      .select({
        grade: STUDENTS.grade,
        count: sql`count(*)::int`,
      })
      .from(STUDENTS)
      .groupBy(STUDENTS.grade)
      .orderBy(STUDENTS.grade);

    // Recent attendance (last 7 days)
    const recentAttendance = await db
      .select({
        date: ATTENDANCE.date,
        present: sql`sum(case when ${ATTENDANCE.present} then 1 else 0 end)::int`,
        absent: sql`sum(case when not ${ATTENDANCE.present} then 1 else 0 end)::int`,
        total: sql`count(*)::int`,
      })
      .from(ATTENDANCE)
      .groupBy(ATTENDANCE.date)
      .orderBy(sql`${ATTENDANCE.date} desc`)
      .limit(7);

    return NextResponse.json({
      data: {
        totalStudents,
        totalRecords,
        presentCount,
        absentCount: totalRecords - presentCount,
        attendancePercentage,
        studentsByGrade,
        recentAttendance: recentAttendance.reverse(),
      },
    });
  } catch (err) {
    console.error("GET /api/dashboard error:", err);
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}
