/*
 * Component: Barchart
 * คำอธิบาย: Graph component สำหรับแสดงข้อมูลรายได้ของแพ็กเกจตามช่วงเวลา
 * ใช้ Chart.js กับ react-chartjs-2 ในการวาดกราฟชนิด ฺBar Chart
 */
import React from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

/*
 * ลงทะเบียน component และ font ของ Chart.js ที่จำเป็นสำหรับ Bar Chart
 */
ChartJS.defaults.font.family = "Sarabun, Prompt, sans-serif";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export type BarChartProps = {
  /** ข้อมูล labels สำหรับแกน X (วันที่) */
  labels: string[];
  /** ข้อมูลสำหรับแกน Y (รายได้) */
  data: number[];
  /** ชื่อกราฟ */
  title?: string;

  className?: string;
};
/*
 * Component: BarChart
 * คำอธิบาย : แสดงกราฟ Bar Chart พร้อม Area Fill สำหรับข้อมูลรายได้แพ็กเกจ
 * Input  : props { labels, data, title?, className?}
 * Output : JSX Element ของกราฟ
 */
export const BarChart: React.FC<BarChartProps> = ({
  labels,
  data,
  title = "รายได้การจองแพ็กเกจทั้งหมด",
  className = "w-full h-[500px] p-6 bg-white rounded-2xl border border-gray-200 shadow-sm",
}) => {
  /**
   * คำอธิบาย : กำหนดข้อมูลและ configuration สำหรับ Chart.js
   */
  const chartData = {
    labels,
    datasets: [
      {
        label: "รายได้ (บาท)",
        data,
        backgroundColor: "rgba(16, 185, 129, 0.6)", // เขียวโปร่งแสง
        borderColor: "#10b981",
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };
  /*
   * คำอธิบาย : กำหนด options สำหรับ Chart.js
   */
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        font: { size: 18, weight: "bold" as const, family: "Sarabun" },
        color: "#111827",
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#10b981",
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context: any) => `฿${context.parsed.y.toLocaleString()} บาท`,
        },
      },
    },

    scales: {
      x: {
        title: {
          display: true,
          text: "วัน",
          color: "#374151",
          font: { size: 14 },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "#6b7280",
          font: { size: 13 },
        },
      },
      y: {
        title: {
          display: true,
          text: "รายได้ (บาท)",
          color: "#374151",
          font: { size: 14 },
        },
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "#6b7280",
          font: { size: 12 },
          callback: function (tickValue: string | number) {
            if (typeof tickValue === "number") {
              return tickValue.toLocaleString();
            }
            const num = Number(tickValue);
            return isNaN(num) ? tickValue : num.toLocaleString();
          },
        },
      },
    },
  };

  return (
    <div className={className}>
      <Bar data={chartData} options={options} />
    </div>
  );
};
