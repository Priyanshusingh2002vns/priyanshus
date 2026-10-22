"use client";
import React from "react";
import styles from './barchart.module.css';
import { useMediaQuery } from "react-responsive";
import {
  ComposedChart,
  Bar,
  Cell,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

// const privateData = [
//   { year: "FY'22", revenue: 35.0, ebitda: 2.8, pat: 0.9 },
//   { year: "FY'23", revenue: 43.4, ebitda: 2.6, pat: 1.0 },
//   { year: "FY'24", revenue: 66.3, ebitda: 7.9, pat: 2.1 },
//   { year: "FY'25", revenue: 101.4, ebitda: 13.1, pat: 6.9 },

// ];
// const publicData = [
//   { year: "FY'22", revenue: 58.1, ebitda: 14.07, pat: 1.51 },
//   { year: "FY'23", revenue: 76.9, ebitda: 15.80, pat: 2.72 },
//   { year: "FY'24", revenue: 78.8, ebitda: 17.32, pat: 1.74 },
//   { year: "FY'25", revenue: 94.1, ebitda: 26.48, pat: 11.97 },

// ]
const Barchart = ({ isPrivateDeal, data: apiData }) => {
  // Transform API data to chart format with error handling
  const transformData = (data) => {
    try {
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn('Barchart: No valid data provided, using fallback');
        return [];
      }

      return data.map(item => {
        if (!item || typeof item !== 'object') {
          console.warn('Barchart: Invalid item in data array', item);
          return null;
        }

        // Ignore observation_and_insights node or items without a valid year
        if (item.observation_and_insights || !item.year || item.year === "0000" || Number(item.year) === 0) {
          return null;
        }

        return {
          year: `FY'${Math.floor(Number(item.year)).toString().slice(-2)}`,
          revenue: Number(item.revenue_in_cr) || 0,
          ebitda: Number(item.ebitda_percent) || 0,
          pat: Number(item.pat_percent) || 0,
        };
      }).filter(item => item !== null); // Remove null items
    } catch (error) {
      console.error('Barchart: Error transforming data', error);
      return [];
    }
  };

  // Safe data selection with fallback
  const chartData = (() => {
    try {
      if (apiData) {
        const transformed = transformData(apiData);
        return transformed;
      }
      return [];
    } catch (error) {
      console.error('Barchart: Error selecting chart data', error);
      return [];
    }
  })();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  return (
    <ResponsiveContainer width="100%" height={isMobile ? 350 : 450} padding={{ top: 10, right: 0, left: 0, bottom: 2 }}>
      <ComposedChart
        data={chartData}
        margin={{ top: 15, right: 5, left: 15, bottom: 20 }}
        barCategoryGap="15%"   // default is ~20–30%
        barGap={2}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#E2E8F0" />

        <XAxis dataKey="year" axisLine={{ stroke: isPrivateDeal ? "#374151" : "#E2E8F0" }}
          tickLine={{ stroke: isPrivateDeal ? "#374151" : "#E2E8F0" }} />

        {/* Left Y-axis for Revenue */}
        <YAxis
          yAxisId="left"
          orientation="left"
          width={70}
          domain={[0, (dataMax) => Math.ceil(dataMax * 1.15)]}
          label={{
            value: "Revenue (₹ Cr)",
            angle: -90,
            position: "insideLeft",
            style: { textAnchor: "middle", fontSize: 15, paddingRight: 50,},
          }}

          tick={{ fontSize: 12 }}
          tickFormatter={(val) => `${Number(val).toLocaleString("en-IN")} Cr`}
          axisLine={{ stroke: isPrivateDeal ? "#374151" : "#E2E8F0" }}
          tickLine={{ stroke: isPrivateDeal ? "#374151" : "#E2E8F0" }}
        />

        {/* Right Y-axis for Margins */}
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={['auto', (dataMax) => Math.ceil(dataMax * 1.15)]}
          label={{
            value: "Margins (%)",
            angle: 90,
            position: "insideRight",
            style: { textAnchor: "middle", fontSize: 15, paddingLeft: 15 },
          }}
          tick={{ fontSize: 14 }}
          tickFormatter={(val) => `${Number(val).toLocaleString("en-IN")}%`}
          axisLine={{ stroke: isPrivateDeal ? "#374151" : "#E2E8F0" }}
          tickLine={{ stroke: isPrivateDeal ? "#374151" : "#E2E8F0" }}
        />

        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div
                  style={{
                    background: "white",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    fontFamily: '"Helvetica Neue", sans-serif',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "#111827",
                    }}
                  >
                    {label}
                  </p>

                  {payload.map((entry, index) => {
                    // 🧮 format based on data key
                    let value = entry.value;
                    let formattedValue = "";
                    if (entry.dataKey === "revenue") {
                      formattedValue = `${Number(value).toLocaleString("en-IN", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })} Cr`;
                    } else if (entry.dataKey === "ebitda" || entry.dataKey === "pat") {
                      formattedValue = `${Number(value).toLocaleString("en-IN", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })} %`;
                    } else {
                      formattedValue = isNaN(Number(value))
                        ? value
                        : Number(value).toLocaleString("en-IN");
                    }

                    return (
                      <p
                        key={`tooltip-${index}`}
                        style={{
                          margin: "4px 0",
                          fontSize: "12px",
                          textTransform: "uppercase",
                          color:
                            entry.dataKey === "ebitda"
                              ? "#4B0082"
                              : entry.dataKey === "pat"
                                ? "#008000"
                                : "#B59131",
                        }}
                      >
                        {`${entry.dataKey} : ${formattedValue}`}
                      </p>
                    );
                  })}
                </div>
              );
            }
            return null;
          }}
        />



        <Legend
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          wrapperStyle={{ paddingTop: 24 }}
          content={(props) => {
            const { payload } = props;

            // Order of legend items as per screenshot
            const orderedKeys = ["revenue", "ebitda", "pat"];

            // Reorder payload
            const sortedPayload = orderedKeys
              .map((key) => payload.find((item) => item.dataKey === key))
              .filter(Boolean);

            return (
              <ul
                className={styles.legends}
              // style={{
              //   display: "flex",
              //   justifyContent: "center",
              //   gap: "20px",

              // }}
              >
                {sortedPayload.map((entry, index) => {
                  const label =
                    entry.dataKey === "revenue"
                      ? "REVENUE"
                      : entry.dataKey === "ebitda"
                        ? "EBITDA %"
                        : "PAT %";

                  return (
                    <li
                      key={`item-${index}`}

                    >
                      {/* Circle color */}
                      <span
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background:
                            entry.dataKey === "revenue"
                              ? "linear-gradient(180deg, #B59131 0%, #E6CF93 100%)"
                              : entry.dataKey === "ebitda"
                                ? "#443197"
                                : "#16A34A",
                        }}
                      />
                      {/* Text style applied */}
                      <span
                        style={{
                          color: isPrivateDeal ? "#FFF" : "var(--Gray-700, #374151)", // ✅ conditional color
                          // fontSize: "14px",
                          // fontStyle: "normal",
                          // fontWeight: 500,
                          // lineHeight: "18px",
                        }}
                      >
                        {label}
                      </span>

                      {/* Divider (not after last item) */}
                      {index !== sortedPayload.length - 1 && (
                        <span
                          style={{
                            display: "inline-block",
                            width: "1px",
                            height: "16px",
                            background: "#E0E6F0",
                            marginLeft: "15px",
                          }}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            );
          }}
        />





        {/* Revenue Bars */}
        <Bar
          yAxisId="left"
          dataKey="revenue"
          barSize={isMobile ? 30 : 83} // 👈 smaller bar on mobile
          radius={[6, 6, 0, 0]}
        >
          {chartData.map((entry, index) => {
            const isLatestYear = index === chartData.length - 1;
            return (
              <Cell
                key={`cell-${index}`}
                fill={isLatestYear ? "url(#latestYearGradient)" : "#F5E3B2"}
              />
            );
          })}
          <LabelList
            dataKey="revenue"
            position="top"
            formatter={(val) => Number(val).toFixed(1)}
            fill="#9CA3AF"
          />
        </Bar>

        {/* EBITDA Line */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="ebitda"
          stroke="#4B0082"
          strokeWidth={3}
          dot={{ r: 6 }}
        />

        {/* PAT Line */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="pat"
          stroke="#008000"
          strokeWidth={3}
          dot={{ r: 6 }}
        />

        {/* Gradient for Bar */}
        <defs>
          <linearGradient id="latestYearGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E4C575" />
            <stop offset="100%" stopColor="#B57D23" />
          </linearGradient>
          <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(181, 145, 49, 1)" />
            <stop offset="100%" stopColor="rgba(230, 207, 147, 1)" />
          </linearGradient>
        </defs>

      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default Barchart;
