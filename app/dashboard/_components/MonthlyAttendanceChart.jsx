"use client";
import React from "react";

export default function MonthlyAttendanceChart({
  presentCount = 0,
  absentCount = 0,
  totalRecords = 0,
}) {
  const hasData = totalRecords > 0;

  // Calculate real attendance percentages with 1 decimal place matching screenshot (83.3 / 16.7)
  const presentPct = hasData
    ? Number(((presentCount / totalRecords) * 100).toFixed(1))
    : 0;
  const absentPct = hasData ? Number((100 - presentPct).toFixed(1)) : 0;

  // SVG Donut geometry
  const size = 200;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const presentLength = hasData ? (presentPct / 100) * circumference : 0;
  const absentLength = hasData ? (absentPct / 100) * circumference : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Title */}
      <div className="mb-2">
        <h2 className="text-lg font-bold text-slate-800">Monthly Attendance</h2>
      </div>

      {/* Donut Chart with side percentage labels */}
      <div className="flex-1 flex items-center justify-center py-4">
        <div className="relative flex items-center justify-center">
          {/* Left percentage label (Total Present - Blue) */}
          <div className="absolute -left-12 sm:-left-14 flex items-center gap-1 select-none">
            <span className="text-sm font-semibold text-[#3b82f6]">
              {hasData ? presentPct : 0}
            </span>
            <div className="w-3 h-px bg-[#3b82f6]/40 hidden sm:block" />
          </div>

          {/* SVG Donut */}
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90"
          >
            {/* Background track (empty state / base) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={hasData ? "#f1f5f9" : "#e2e8f0"}
              strokeWidth={strokeWidth}
            />

            {hasData && (
              <>
                {/* Blue segment (Total Present) */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${presentLength} ${circumference}`}
                  strokeDashoffset={0}
                  className="transition-all duration-700 ease-out"
                />

                {/* Teal segment (Total Absent) */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke="#20d4be"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${absentLength} ${circumference}`}
                  strokeDashoffset={-presentLength}
                  className="transition-all duration-700 ease-out"
                />
              </>
            )}
          </svg>

          {/* Right percentage label (Total Absent - Teal) */}
          <div className="absolute -right-12 sm:-right-14 flex items-center gap-1 select-none">
            <div className="w-3 h-px bg-[#20d4be]/40 hidden sm:block" />
            <span className="text-sm font-semibold text-[#20d4be]">
              {hasData ? absentPct : 0}
            </span>
          </div>
        </div>
      </div>

      {/* Legend / Info footer */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-2 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#3b82f6] rounded-full shrink-0" />
          <span className="text-xs font-medium text-slate-600">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#20d4be] rounded-full shrink-0" />
          <span className="text-xs font-medium text-slate-600">Absent</span>
        </div>
      </div>
    </div>
  );
}

