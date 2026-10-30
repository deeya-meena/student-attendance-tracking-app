import { db } from "@/utils/postgres";
import { ATTENDANCE, STUDENTS } from "@/utils/schema";
import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

// GET /api/dashboard  — returns statistics for the dashboard
export async function GET(req) {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const grade = searchParams.get("grade");
  const month = searchParams.get("month"); // e.g. "2024-05"

  try {
    // 1. Total students condition
    const studentConditions = [];
    if (grade && grade !== "ALL") {
      studentConditions.push(eq(STUDENTS.grade, grade));
    }

    const studentQuery = db.select({ count: sql`count(*)::int` }).from(STUDENTS);
    const [{ count: totalStudents }] =
      studentConditions.length > 0
        ? await studentQuery.where(and(...studentConditions))
        : await studentQuery;

    // 2. Attendance conditions
    const attendanceConditions = [];
    if (grade && grade !== "ALL") {
      attendanceConditions.push(eq(ATTENDANCE.grade, grade));
    }
    if (month && month !== "ALL") {
      attendanceConditions.push(sql`${ATTENDANCE.date}::text LIKE ${month + "%"}`);
    }

    const totalAttendanceQuery = db
      .select({ count: sql`count(*)::int` })
      .from(ATTENDANCE);
    const [{ count: totalRecords }] =
      attendanceConditions.length > 0
        ? await totalAttendanceQuery.where(and(...attendanceConditions))
        : await totalAttendanceQuery;

    // Present count
    const presentConditions = [
      ...attendanceConditions,
      eq(ATTENDANCE.present, true),
    ];
    const [{ count: presentCount }] = await db
      .select({ count: sql`count(*)::int` })
      .from(ATTENDANCE)
      .where(and(...presentConditions));

    const absentCount = totalRecords - presentCount;

    // Accurate percentages
    const attendancePercentage =
      totalRecords > 0
        ? Number(((presentCount / totalRecords) * 100).toFixed(1))
        : 0;

    const absentPercentage =
      totalRecords > 0
        ? Number(((absentCount / totalRecords) * 100).toFixed(1))
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

    // Recent attendance records
    let recentQuery = db
      .select({
        date: ATTENDANCE.date,
        present: sql`sum(case when ${ATTENDANCE.present} then 1 else 0 end)::int`,
        absent: sql`sum(case when not ${ATTENDANCE.present} then 1 else 0 end)::int`,
        total: sql`count(*)::int`,
      })
      .from(ATTENDANCE);

    if (attendanceConditions.length > 0) {
      recentQuery = recentQuery.where(and(...attendanceConditions));
    }

    const recentAttendance = await recentQuery
      .groupBy(ATTENDANCE.date)
      .orderBy(sql`${ATTENDANCE.date} desc`)
      .limit(7);

    return NextResponse.json({
      data: {
        totalStudents,
        totalRecords,
        presentCount,
        absentCount,
        attendancePercentage,
        absentPercentage,
        studentsByGrade,
        recentAttendance: recentAttendance.reverse(),
      },
    });
  } catch (err) {
    console.error("GET /api/dashboard error:", err);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
