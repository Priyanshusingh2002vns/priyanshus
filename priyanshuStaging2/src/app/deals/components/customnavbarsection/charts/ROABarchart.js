"use client";
import React from "react";
import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList,
} from "recharts";

const CustomBar = (props) => {
    const { fill, x, y, width, height, value } = props;
    if (width <= 0 || height === 0) return null;
    const r = Math.min(8, Math.abs(height), width / 2);
    
    let path = "";
    if (value >= 0) {
        path = `M${x},${y + height} 
                L${x},${y + r} 
                A${r},${r} 0 0,1 ${x + r},${y} 
                L${x + width - r},${y} 
                A${r},${r} 0 0,1 ${x + width},${y + r} 
                L${x + width},${y + height} Z`;
    } else {
        path = `M${x},${y + height} 
                L${x + width},${y + height} 
                L${x + width},${y - r} 
                A${r},${r} 0 0,1 ${x + width - r},${y} 
                L${x + r},${y} 
                A${r},${r} 0 0,1 ${x},${y - r} Z`;
    }
    
    return <path d={path} fill={fill} />;
};

const ROABarchart = ({ isPrivate, data: apiData }) => {
    // Transform API data to chart format with error handling
    const transformData = (data) => {
        try {
            if (!data || !Array.isArray(data) || data.length === 0) {
                console.warn('ROABarchart: No valid data provided, using fallback');
                return [];
            }

            return data
                .map(item => {
                    if (!item || typeof item !== 'object' || item.observation_and_insights || !item.year) {
                        return null;
                    }

                    return {
                        year: Math.floor(Number(item.year)).toString(),
                        value: Number(item.roa) || Number(item.roa_percent) || 0
                    };
                })
                .filter(item => item !== null)
                .sort((a, b) => Number(a.year) - Number(b.year));
        } catch (error) {
            console.error('ROABarchart: Error transforming data', error);
            return [];
        }
    };

    // Safe data selection with fallback
    const chartData = (() => {
        try {
            if (apiData) {
                const transformed = transformData(apiData);
                // Make sure we have valid non-zero values to present
                const validData = transformed.filter(item => item.value !== 0);
                return validData;
            }
            return [];
        } catch (error) {
            console.error('ROABarchart: Error selecting chart data', error);
            return [];
        }
    })();

    const { ticks, domain } = React.useMemo(() => {
        const hasNegative = chartData.some(d => d.value < 0);
        
        if (hasNegative) {
            const maxAbsVal = Math.max(...chartData.map(d => Math.abs(d.value)), 0) || 31.8;
            
            // Nice steps for ranges with negative values
            const rawInterval = maxAbsVal / 2.0;
            const magnitude = Math.pow(10, Math.floor(Math.log10(rawInterval)));
            const normalized = rawInterval / magnitude;
            
            const niceSteps = [1, 2, 5, 10];
            const step = niceSteps.find(s => s >= normalized) || 10;
            const interval = step * magnitude;
            
            const generatedTicks = [
                Number((-2 * interval).toFixed(4)),
                Number((-interval).toFixed(4)),
                0,
                Number(interval.toFixed(4)),
                Number((2 * interval).toFixed(4))
            ];
            
            return {
                ticks: generatedTicks,
                domain: [Number((-2 * interval).toFixed(4)), Number((2 * interval).toFixed(4))]
            };
        } else {
            const maxVal = Math.max(...chartData.map(d => d.value), 0) || 31.8;
            
            const rawInterval = maxVal / 3.5;
            const magnitude = Math.pow(10, Math.floor(Math.log10(rawInterval)));
            const normalized = rawInterval / magnitude;
            
            const niceSteps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
            const step = niceSteps.find(s => s >= normalized) || 10;
            const interval = step * magnitude;
            
            const generatedTicks = [
                0,
                Number(interval.toFixed(4)),
                Number((2 * interval).toFixed(4)),
                Number((3 * interval).toFixed(4)),
                Number((4 * interval).toFixed(4))
            ];
            
            return {
                ticks: generatedTicks,
                domain: [0, Number((4 * interval).toFixed(4))]
            };
        }
    }, [chartData]);

    const renderCustomizedLabel = (props) => {
        const { x, y, width, height, value } = props;
        const isNegative = value < 0;
        // Position below negative bars, above positive ones
        const labelY = isNegative ? y + height + 18 : y - 8;
        return (
            <text
                x={x + width / 2}
                y={labelY}
                fill="var(--Gray-500, #4B5563)"
                fontSize="13px"
                fontFamily="Helvetica Neue, Helvetica, sans-serif"
                fontWeight={500}
                textAnchor="middle"
            >
                {value.toFixed(1)}%
            </text>
        );
    };

    return (
        <ResponsiveContainer width="100%" height={320}>
            <BarChart key={JSON.stringify(chartData)} data={chartData} barSize={77} margin={{ top: 25, right: 10, left: 15, bottom: 20 }}>
                <defs>
                    <linearGradient id="roaLatestBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E4C575" />
                        <stop offset="100%" stopColor="#B57D23" />
                    </linearGradient>
                </defs>
                <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={isPrivate ? "#374151" : "#F3F4F6"}
                />
                <XAxis
                    dataKey="year"
                    tick={{
                        fill: "var(--Gray-500, #4B5563)", // text color
                        fontSize: 13,
                        fontFamily: "Helvetica Neue, Helvetica, sans-serif",
                        fontWeight: 500,
                    }}
                    axisLine={{ stroke: isPrivate ? "#374151" : "#E2E8F0" }}
                    tickLine={false}
                />
                <YAxis
                    domain={domain}
                    ticks={ticks}
                    width={65}
                    tick={{
                        fill: "var(--Gray-500, #4B5563)", // text color
                        fontSize: 13,
                        fontFamily: "Helvetica Neue, Helvetica, sans-serif",
                        fontWeight: 500,
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                    cursor={{ fill: "transparent" }}
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div
                                    style={{
                                        background: isPrivate ? "#1F2937" : "#fff",
                                        padding: "8px 12px",
                                        border: `1px solid ${isPrivate ? "#374151" : "#E5E7EB"}`,
                                        borderRadius: "6px",
                                        boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                                        color: isPrivate ? "#fff" : "#1F2937",
                                    }}
                                >
                                    <p style={{ margin: 0, fontWeight: "600", fontSize: 13 }}>{label}</p>
                                    <p style={{ margin: 0, color: "#B57D23", fontSize: 13, fontWeight: "500" }}>
                                        ROA: {Number(payload[0].value).toFixed(1)}%
                                    </p>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Bar
                    dataKey="value"
                    shape={<CustomBar />}
                >
                    {chartData.map((entry, index) => {
                        const isLatest = index === chartData.length - 1;
                        let fillVal = isLatest ? "url(#roaLatestBarGradient)" : "#F5E3B2";
                        // If negative, use a soft cool grey
                        if (entry.value < 0) {
                            fillVal = "#E2E8F0";
                        }
                        return (
                            <Cell
                                key={`cell-${index}`}
                                fill={fillVal}
                            />
                        );
                    })}
                    <LabelList
                        dataKey="value"
                        content={renderCustomizedLabel}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default ROABarchart;
