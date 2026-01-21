/*
 * คำอธิบาย: Graph component สำหรับแสดงข้อมูลสถิติการจองแพ็กเกจในรูปแบบ Pie/Doughnut Chart
 * ใช้ Chart.js กับ react-chartjs-2 ในการวาดกราฟวงกลม แสดงสัดส่วนการจองสำเร็จและยกเลิก
 * รองรับการแสดงข้อมูลจาก props และการปรับแต่งสีตามธีม
 */
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Title,
  Tooltip,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

/*
 * คำอธิบาย: ลงทะเบียน component ของ Chart.js ที่จำเป็น
 * Input : ไม่มี
 * Output : void
 */
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title
);

/*
 * Props สำหรับ PieGraph
 */
export type PieGraphProps = {
  /** จำนวนการจองสำเร็จ */
  successCount: number;
  /** จำนวนการจองยกเลิก */
  cancelledCount: number;
  /** ชื่อกราฟ */
  title?: string;
  className?: string;
};

/**
 * คำอธิบาย: แสดงกราฟ Doughnut Chart สำหรับข้อมูลการจองสำเร็จและยกเลิก
 * Input:
 *   - successCount: จำนวนการจองสำเร็จ
 *   - cancelledCount: จำนวนการจองยกเลิก
 *   - title: ชื่อกราฟ
 *   - className: คลาสเสริม
 * Output: JSX Element ของกราฟ
 */
export default function PieGraph({
  successCount,
  cancelledCount,
  title = "สถิติการจองแพ็กเกจ",
  className = "w-full h-64 p-4 bg-white rounded-lg border border-gray-200 shadow-sm",
}: PieGraphProps) {
  const total = successCount + cancelledCount;
  const hasNoData = total === 0;

  /*
   * คำอธิบาย : กำหนดข้อมูลและ configuration สำหรับ Chart.js
   * Input : ไม่มี
   * Output : config object สำหรับ Doughnut chart
   */
  const chartData = {
    labels: hasNoData ? ["ไม่มีข้อมูล"] : ["การจองสำเร็จ", "ยกเลิกการจอง"],
    datasets: [
      {
        data: hasNoData ? [1] : [successCount, cancelledCount],
        backgroundColor: hasNoData
          ? ["#e5e7eb"] // gray-200 สำหรับไม่มีข้อมูล
          : [
              "#10b981", // green-500 สำหรับสำเร็จ
              "#d1fae5", // green-100 สำหรับยกเลิก
            ],
        borderColor: "#ffffff",
        borderWidth: 2,
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
    cutout: "60%", // ทำให้เป็น doughnut chart (วงกลมกลวง)
    layout: {
      padding: {
        right: 0,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "right" as const,
        labels: {
          padding: 15,
          font: {
            size: 14,
          },
          generateLabels: function (chart: any) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, index: number) => {
                const dataset = data.datasets[0];
                const value = dataset.data[index];
                // ถ้าไม่มีข้อมูลแสดงแค่ label โดยไม่มี percentage
                const text = hasNoData
                  ? label
                  : `${label} (${((value / total) * 100).toFixed(2)}%)`;
                return {
                  text: text,
                  fillStyle: dataset.backgroundColor[index],
                  hidden: false,
                  index: index,
                };
              });
            }
            return [];
          },
        },
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: "bold" as const,
        },
        color: "#111827", // gray-900
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#10b981",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function (context: any) {
            const value = context.parsed;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : "0";
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className={className}>
      <div className="relative h-full">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}
