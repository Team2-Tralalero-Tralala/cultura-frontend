/*
 * Component: LineGraph (Client)
 * คำอธิบาย: Graph component สำหรับแสดงข้อมูลการจองแพ็กเกจในช่วงเวลาที่กำหนด
 * ใช้ Chart.js กับ react-chartjs-2 ในการวาดกราฟชนิด Line Chart พร้อม Area Fill
 * รองรับการแสดงข้อมูลจาก props และการปรับแต่งสีตามธีม
 */
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { AlignRight } from "lucide-react";
import React from "react";
import { Line } from "react-chartjs-2";

/*
 * ลงทะเบียน component ของ Chart.js ที่จำเป็น
 * Input : ไม่มี
 * Output : void
 */
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

/*
 * Props สำหรับ LineGraph
 */
export type LineGraphProps = {
  /** ข้อมูล labels สำหรับแกน X (วันที่) */
  labels: string[];
  /** ข้อมูลสำหรับแกน Y (จำนวนการจอง) */
  data: number[];
  /** ชื่อกราฟ */
  title?: string;

  className?: string;
  labelX?: string;
};

/**
 * คำอธิบาย: แสดงกราฟ Line Chart พร้อม Area Fill สำหรับข้อมูลการจองแพ็กเกจ
 * Input:
 *   - labels: ข้อมูลแกน X (วันที่)
 *   - data: ข้อมูลแกน Y (จำนวนการจอง)
 *   - title: ชื่อกราฟ
 *   - className: คลาสเสริม
 *   - labelX: ชื่อแกน X
 * Output: JSX Element ของกราฟ
 */
export default function LineGraph({
  labels,
  data,
  title = "จำนวนการจองแพ็กเกจทั้งหมด",
  className = "w-full h-64 p-4 bg-white rounded-lg border border-gray-200 shadow-sm",
  labelX,
}: LineGraphProps) {
  /*
   * คำอธิบาย : กำหนดข้อมูลและ configuration สำหรับ Chart.js
   * Input : ไม่มี
   * Output : config object สำหรับ Line chart
   */
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "จำนวนการจอง",
        data: data,
        borderColor: "#10b981", // green-500
        backgroundColor: "rgba(16, 185, 129, 0.2)", // green-500 with transparency
        fill: true,
        tension: 0.4, // ทำให้เส้นโค้งนุ่มนวล
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
    ],
  };

  /*
   * คำอธิบาย : กำหนด options สำหรับ Chart.js
   * Input : ไม่มี
   * Output : options object
   */
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // ซ่อน legend เนื่องจากเรามี title แล้ว
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 18,
          weight: "bold" as const,
        },
        color: "#111827", // gray-900
        padding: {
          top: 10,
          bottom: 20,
        },
        align: "start" as const,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#10b981",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function (context: any) {
            return `${context.parsed.y} รายการ`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: !!labelX,
          text: labelX,
          align: "end" as const,
          color: "#000",
          font: { size: 14, weight: "bold" as const },
        },
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "#6b7280", // gray-500
          font: {
            size: 12,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "จำนวน",
          align: "end" as const,
          color: "#000",
          font: { size: 14, weight: "bold" as const },
        },
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "#6b7280", // gray-500
          font: {
            size: 12,
          },
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className={className}>
      <Line data={chartData} options={options} />
    </div>
  );
}
