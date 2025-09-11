import React, { useState } from "react";
import {
    PieChart, Pie, Cell, Sector, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
    BarChart, Bar, Legend,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

function CustomActiveShape(props) {
    const RADIAN = Math.PI / 180;
    const {
        cx, cy, midAngle, innerRadius, outerRadius,
        startAngle, endAngle, fill, payload, percent,
    } = props;

    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;

    return (
        <g>
            <text
                x={cx}
                y={cy}
                dy={8}
                textAnchor="middle"
                fill={fill}
                style={{ fontWeight: 700 }}
            >
                {payload.name}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <path d={`M${sx},${sy}L${mx},${my}`} stroke={fill} fill="none" />
            <circle cx={mx} cy={my} r={3} fill={fill} stroke="none" />
            <text
                x={mx + 8}
                y={my}
                textAnchor="start"
                fill="#333"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        </g>
    );
}

export default function Charts({ snapshots = [], summary = {} }) {
    // Pie chart data
    const correct = Math.max(
        0,
        Math.round((summary.charCount || 0) - (summary.mistakes || 0))
    );
    const incorrect = summary.mistakes || 0;
    const left = Math.max(
        0,
        (summary.duration || 0) * 5 - (summary.charCount || 0)
    );

    const pieData = [
        { name: "Correct", value: correct },
        { name: "Incorrect", value: incorrect },
        { name: "Remaining", value: Math.max(0, left) },
    ];

    // Line & Bar chart data (safe fallbacks)
    const lineData = snapshots.length
        ? snapshots.map((s, i) => {
            const elapsed = s.second ?? i + 1;
            const charsTyped = s.charCount ?? 0;
            const mistakes = s.mistakes ?? 0;

            const kpm =
                elapsed > 0 ? Math.round((charsTyped / elapsed) * 60) : 0;
            const wpm =
                elapsed > 0 ? Math.round((charsTyped / 5 / elapsed) * 60) : 0;

            return {
                index: i + 1,
                second: elapsed,
                wpm: isFinite(wpm) ? wpm : 0,
                kpm: isFinite(kpm) ? kpm : 0,
                mistakes: isFinite(mistakes) ? mistakes : 0,
            };
        })
        : [{ index: 0, second: 0, wpm: 0, kpm: 0, mistakes: 0 }];

    const [activeIndex, setActiveIndex] = useState(0);

    console.log({ snapshots, summary, pieData, lineData },"Charts data");

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pie Chart */}
            <div className="h-64 p-2 bg-white dark:bg-gray-900 rounded shadow-sm">
                <h5 className="text-sm mb-2">Accuracy Distribution</h5>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            innerRadius={40}
                            outerRadius={70}
                            dataKey="value"
                            activeIndex={activeIndex}
                            activeShape={CustomActiveShape}
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                        >
                            {pieData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Line Chart */}
            <div className="h-64 p-2 bg-white dark:bg-gray-900 rounded col-span-2 shadow-sm">
                <h5 className="text-sm mb-2">Typing Speed (WPM vs KPM)</h5>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="index" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="wpm"
                            stroke="#8884d8"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="kpm"
                            stroke="#82ca9d"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="h-64 p-2 bg-white dark:bg-gray-900 rounded col-span-3 shadow-sm">
                <h5 className="text-sm mb-2">Error Heatmap</h5>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="index" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="mistakes" fill="#ff6b6b" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
