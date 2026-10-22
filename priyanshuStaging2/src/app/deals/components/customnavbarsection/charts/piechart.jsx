import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const Piechart = ({ data = [], COLORS = [], centerContent }) => {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={450}
            innerRadius="55%"
            outerRadius="77%"
            paddingAngle={2}
            dataKey="value"
            cornerRadius={10}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          {/* Center Content */}
          <foreignObject x="35%" y="40%" width="30%" height="20%">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                textAlign: "center",
                fontSize: "14px",
              }}
            >
              {centerContent}
            </div>
          </foreignObject>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Piechart;
