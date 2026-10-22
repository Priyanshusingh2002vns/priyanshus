"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

export default function PurpleBarchart({ isPrivate, data }) {
  // Transform API data to chart format with error handling
const transformData = (apiData) => {
  try {
    if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
      console.warn("PurpleBarchart: No valid data provided, using fallback");
      return [];
    }

    return apiData
      .map((item) => {
        if (!item || typeof item !== "object") {
          console.warn("PurpleBarchart: Invalid item in data array", item);
          return null;
        }

        // Ignore observation_and_insights node or items without a valid year
        if (item.observation_and_insights || !item.year || item.year === "0000" || Number(item.year) === 0) {
          return null;
        }

        return {
          year: `FY'${Math.floor(Number(item.year)).toString().slice(-2)}`,

          // FIX: convert both number and string to number
          growth: Number(item.roe_percent) || 0,
        };
      })
      .filter((item) => item !== null);
  } catch (error) {
    console.error("PurpleBarchart: Error transforming data", error);
    return [];
  }
};


  // Safe data selection with fallback
  const chartData = (() => {
    try {
      if (data) {
        const transformed = transformData(data);
        return transformed;
      }
      return [];
    } catch (error) {
      console.error('PurpleBarchart: Error selecting chart data', error);
      return [];
    }
  })();
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer padding={{ top: 10, right: 0, left: 0, bottom: 2 }}>
        <BarChart data={chartData} barSize={60}>
        <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={isPrivate ? "#374151" : "#E2E8F0"}
                />
          <XAxis dataKey="year"
            tick={{
              fill: "var(--Gray-500, #9CA3AF)", // text color
              fontSize: 14,
              fontStyle: "normal",
              fontWeight: 500,
              letterSpacing: -0.56,
              

            }}
            axisLine={{ stroke: isPrivate ? "#374151" : "#E2E8F0" }}
            tickLine={{ stroke: isPrivate ? "#374151" : "#E2E8F0" }} />
          <YAxis
          domain={[0, (dataMax) => dataMax + 10]}
            tickFormatter={(value) => `${value}%`}
            // domain={[-40, 40]} // You can make this dynamic later
            tick={{
              fill: "var(--Gray-500, #9CA3AF)", // text color
              fontSize: 14,
              fontStyle: "normal",
              fontWeight: 500,
              letterSpacing: -0.56,
              // aligns right
            }}
            axisLine={{ stroke: isPrivate ? "#374151" : "#E2E8F0" }}
            tickLine={{ stroke: isPrivate ? "#374151" : "#010408ff" }}
          />
           <Tooltip
                             cursor={{ fill: "transparent" }}
                             content={({ active, payload, label }) => {
                                 if (active && payload && payload.length) {
                                     return (
                                         <div
                                             style={{
                                                 background: "#fff",
                                                 padding: "8px 12px",
                                                 border: "1px solid #ccc",
                                                 borderRadius: "6px",
                                             }}
                                         >
                                             <p style={{ margin: 0, fontWeight: "600" }}>{label}</p>
                                             <p style={{ margin: 0, color: "#e6cf93" }}>
                                                 ROE: {payload[0].value}%
                                             </p>
                                         </div>
                                     );
                                 }
                                 return null;
                             }}
                         />
          <Bar dataKey="growth" fill="#E4C575" radius={[5, 5, 0, 0]}>
            <LabelList
              dataKey="growth"
              position="top"
              formatter={(value) => `${value}%`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
