"use client";
import React, { useState } from "react";

export default function AttendanceChart({ data = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Compute maximum value for Y axis (minimum 12 with steps of 3 to match reference screenshot)
  const highestCount = data.reduce(
    (max, item) => Math.max(max, item.present || 0, item.absent || 0),
    0
  );

  // Choose a nice ceiling, default 12 like in the screenshot
  const maxVal = Math.max(12, Math.ceil(highestCount / 3) * 3);
  const yTicks = [
    maxVal,
    Math.round(maxVal * 0.75),
    Math.round(maxVal * 0.5),
    Math.round(maxVal * 0.25),
    0,
  ];

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 250;
  const marginLeft = 45;
  const marginRight = 25;
  const marginTop = 20;
  const marginBottom = 35;

  const plotWidth = svgWidth - marginLeft - marginRight;
  const plotHeight = svgHeight - marginTop - marginBottom;
  const baselineY = marginTop + plotHeight;

  // Format label for X axis (e.g. "3", "2", "1" or day number)
  const formatDayLabel = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return parseInt(parts[2], 10).toString();
    }
    const d = new Date(dateStr + "T00:00:00");
    return isNaN(d.getTime()) ? dateStr : d.getDate().toString();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Title */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-slate-800">Attendance</h2>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto"
          style={{ minHeight: "220px" }}
        >
          {/* Dashed Horizontal Grid Lines */}
          {yTicks.map((tickVal, idx) => {
            const y = marginTop + (idx / (yTicks.length - 1)) * plotHeight;
            return (
              <g key={`grid-${tickVal}-${idx}`}>
                <line
                  x1={marginLeft}
                  y1={y}
                  x2={svgWidth - marginRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                {/* Y Axis tick label */}
                <text
                  x={marginLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-xs font-medium"
                  style={{ fontSize: "11px" }}
                >
                  {tickVal}
                </text>
              </g>
            );
          })}

          {/* Left Y-Axis solid line */}
          <line
            x1={marginLeft}
            y1={marginTop}
            x2={marginLeft}
            y2={baselineY}
            stroke="#cbd5e1"
            strokeWidth="1"
          />

          {/* Bottom X-Axis solid line */}
          <line
            x1={marginLeft}
            y1={baselineY}
            x2={svgWidth - marginRight}
            y2={baselineY}
            stroke="#cbd5e1"
            strokeWidth="1"
          />

          {/* Grouped Bars */}
          {data.length > 0 ? (
            data.map((item, idx) => {
              const groupWidth = plotWidth / data.length;
              const groupCenterX = marginLeft + idx * groupWidth + groupWidth / 2;

              // Bar sizing
              const barWidth = Math.min(36, Math.max(20, groupWidth * 0.35));
              const barGap = 4;

              const presentHeight = Math.max(
                0,
                ((item.present || 0) / maxVal) * plotHeight
              );
              const absentHeight = Math.max(
                0,
                ((item.absent || 0) / maxVal) * plotHeight
              );

              const presentX = groupCenterX - barWidth - barGap / 2;
              const absentX = groupCenterX + barGap / 2;

              const presentY = baselineY - presentHeight;
              const absentY = baselineY - absentHeight;

              const dayLabel = formatDayLabel(item.date);
              const isHovered = hoveredIndex === idx;

              return (
                <g
                  key={item.date || idx}
                  className="cursor-pointer transition-opacity"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Invisible hit area for hover */}
                  <rect
                    x={groupCenterX - groupWidth / 2}
                    y={marginTop}
                    width={groupWidth}
                    height={plotHeight}
                    fill="transparent"
                  />

                  {/* Total Present Bar (Blue) */}
                  <rect
                    x={presentX}
                    y={presentY}
                    width={barWidth}
                    height={presentHeight}
                    fill="#3b82f6"
                    className="transition-all duration-300"
                    opacity={hoveredIndex === null || isHovered ? 1 : 0.6}
                  />

                  {/* Total Absent Bar (Teal) */}
                  <rect
                    x={absentX}
                    y={absentY}
                    width={barWidth}
                    height={absentHeight}
                    fill="#20d4be"
                    className="transition-all duration-300"
                    opacity={hoveredIndex === null || isHovered ? 1 : 0.6}
                  />

                  {/* X-Axis day label */}
                  <text
                    x={groupCenterX}
                    y={baselineY + 18}
                    textAnchor="middle"
                    className="fill-slate-600 text-xs font-medium"
                    style={{ fontSize: "12px" }}
                  >
                    {dayLabel}
                  </text>
                </g>
              );
            })
          ) : (
            /* Empty state when no records */
            <text
              x={marginLeft + plotWidth / 2}
              y={marginTop + plotHeight / 2}
              textAnchor="middle"
              className="fill-slate-400 text-sm font-medium"
              style={{ fontSize: "13px" }}
            >
              No attendance records recorded yet
            </text>
          )}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIndex !== null && data[hoveredIndex] && (
          <div
            className="absolute top-2 right-4 bg-slate-900/90 backdrop-blur-xs text-white text-xs rounded-lg py-1.5 px-3 shadow-md pointer-events-none transition-all duration-150"
          >
            <div className="font-semibold text-slate-200 mb-1">
              Date: {data[hoveredIndex].date}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-xs bg-[#3b82f6]" />
              <span>Present: {data[hoveredIndex].present ?? 0}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-xs bg-[#20d4be]" />
              <span>Absent: {data[hoveredIndex].absent ?? 0}</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend matching screenshot */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-2 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 bg-[#3b82f6] rounded-xs shrink-0" />
          <span className="text-xs font-medium text-slate-600">Total Present</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 bg-[#20d4be] rounded-xs shrink-0" />
          <span className="text-xs font-medium text-slate-600">Total Absent</span>
        </div>
      </div>
    </div>
  );
}

