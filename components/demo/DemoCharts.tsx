"use client";

import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    ChartData,
    ChartOptions,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler
);

export const ELISE_COLORS = {
    primary: "#FF6B35",
    primarySoft: "rgba(255, 107, 53, 0.15)",
    secondary: "#2563eb",
    secondarySoft: "rgba(37, 99, 235, 0.15)",
    green: "#16a34a",
    amber: "#f59e0b",
    rose: "#e11d48",
    slate: "#64748b",
    palette: ["#FF6B35", "#2563eb", "#16a34a", "#f59e0b", "#8b5cf6", "#e11d48", "#0ea5e9", "#64748b"],
};

const baseOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: "bottom",
            labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } },
        },
    },
};

interface BarChartProps {
    data: ChartData<"bar">;
    options?: ChartOptions<"bar">;
    height?: number;
}

export function BarChart({ data, options, height = 280 }: BarChartProps) {
    return (
        <div style={{ height }}>
            <Bar data={data} options={{ ...baseOptions, ...options }} />
        </div>
    );
}

interface LineChartProps {
    data: ChartData<"line">;
    options?: ChartOptions<"line">;
    height?: number;
}

export function LineChart({ data, options, height = 280 }: LineChartProps) {
    return (
        <div style={{ height }}>
            <Line data={data} options={{ ...baseOptions, ...options }} />
        </div>
    );
}

interface DoughnutChartProps {
    data: ChartData<"doughnut">;
    options?: ChartOptions<"doughnut">;
    height?: number;
}

export function DoughnutChart({ data, options, height = 280 }: DoughnutChartProps) {
    return (
        <div style={{ height }}>
            <Doughnut data={data} options={{ ...baseOptions, ...options }} />
        </div>
    );
}
