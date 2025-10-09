// Components/CardPackage.tsx

/*
 * ชื่อไฟล์: CardPackage.tsx
 * คำอธิบาย: Component สำหรับแสดงข้อมูลแพ็กเกจท่องเที่ยว (รูป/ชื่อ/ที่ตั้ง/สถานะจอง/จำนวนคน/แท็ก/ราคา)
 * วัตถุประสงค์: ใช้เป็นการ์ดแสดงผลในหน้าแสดงรายการแพ็กเกจ (สามารถคลิกเพื่อดูรายละเอียด)
 * ผู้รับผิดชอบ: Frontend (Team 2)
 * เวอร์ชัน: 1.0.0
 * อ้างอิงมาตรฐาน: การเขียนคอมเมนต์ของไฟล์ Component และฟังก์ชัน (มาตรฐานข้อ 8) 
 */

/* -------------------------------------------------------------------------- */
/*                                  Imports                                   */
/* -------------------------------------------------------------------------- */

import React, { type JSX } from "react";

/* -------------------------------------------------------------------------- */
/*                                 Type & Props                                */
/* -------------------------------------------------------------------------- */

/*
 * คำอธิบาย: BookingStatus – สถานะการเปิดจองของแพ็กเกจ
 * ค่าที่รองรับ: "OPEN" | "CLOSED" | "UPCOMING"
 */
type BookingStatus = "OPEN" | "CLOSED" | "UPCOMING";

/*
 * คำอธิบาย: CardPackageProps – โพรพสำหรับ CardPackage
 * Input:
 *   - image: URL รูปหน้าปก
 *   - title: ชื่อแพ็กเกจ
 *   - location: ที่ตั้ง (เช่น อำเภอ จังหวัด)
 *   - bookingStart/bookingEnd: วันเริ่ม–สิ้นสุดเปิดจอง (string ISO หรือ Date)
 *   - bookingStatus: สถานะการเปิดจอง
 *   - statusText: ข้อความสถานะ (fallback)
 *   - booked/capacity: จำนวนผู้จอง/ความจุ
 *   - tags: แท็กแสดงใต้การ์ด
 *   - priceTHB: ราคา (หน่วยบาท)
 *   - onClick: อีเวนต์คลิกการ์ด
 *   - className: คลาสเพิ่มสำหรับปรับแต่ง
 * Output:
 *   - ใช้ในการเรนเดอร์การ์ดแพ็กเกจ 1 ใบ
 */
type CardPackageProps = {
  image: string;
  title: string;
  location: string;

  /** รับจาก backend เป็น string ISO หรือ Date ที่ new Date() แปลงได้ */
  bookingStart?: string | Date | null;
  bookingEnd?: string | Date | null;
  bookingStatus?: BookingStatus;

  /** fallback เก่า เผื่อจุดอื่นยังส่งอยู่ */
  statusText?: string;

  booked?: number;
  capacity?: number;
  tags?: string[];
  priceTHB?: number;
  onClick?: () => void;
  className?: string;
};

/* -------------------------------------------------------------------------- */
/*                                 Utilities                                  */
/* -------------------------------------------------------------------------- */

/*
 * คำอธิบาย: แปลงค่า (string | Date | null | undefined) ให้เป็น Date ที่ใช้งานได้
 * Input : d (string | Date | null | undefined)
 * Output: Date | undefined (undefined เมื่อแปลงไม่ได้)
 */
function toDate(d?: string | Date | null) {
  if (!d) return undefined;
  const v = typeof d === "string" ? new Date(d) : d;
  return isNaN(v.getTime()) ? undefined : v;
}

/*
 * คำอธิบาย: จัดรูปวันที่เป็นแบบไทย “ตัวย่อเดือน” เช่น 27 พ.ค. 2568
 * Input : d (Date | undefined)
 * Output: string (วันที่แสดงผล), ค่าว่างเมื่อไม่มีวันที่
 */
function formatThaiDate(d?: Date) {
  if (!d) return "";
  const day = d.getDate();
  const monthShort = d.toLocaleString("th-TH", { month: "short" }); // ม.ค., ก.พ., ...
  const yearBE = d.getFullYear() + 543;
  return `${day} ${monthShort} ${yearBE}`;
}

/*
 * คำอธิบาย: สร้างข้อความสถานะการจองตามสถานะ + ช่วงวัน
 * Input :
 *   - status: BookingStatus | undefined
 *   - start : Date | undefined (วันเริ่มเปิดจอง)
 *   - end   : Date | undefined (วันสิ้นสุดเปิดจอง)
 *   - fallback: string | undefined (หากส่งมาก็ใช้ก่อน)
 * Output:
 *   - string: ข้อความสถานะพร้อมวันที่ตามตรรกะ (เช่น "เปิดจองแล้ว วันที่ 27 พ.ค. 2568 ถึง 31 ก.ค. 2568")
 */
function buildStatusText(
  status?: BookingStatus,
  start?: Date,
  end?: Date,
  fallback?: string
) {
  if (fallback) return fallback;

  if (status === "OPEN" && start && end) {
    return `เปิดจองแล้ว วันที่ ${formatThaiDate(start)} ถึง ${formatThaiDate(end)}`;
  }
  if (status === "UPCOMING" && start) {
    return `เปิดให้จองวันที่ ${formatThaiDate(start)}`;
  }
  if (status === "CLOSED" && end) {
    return `ปิดจองแล้ว ตั้งแต่ ${formatThaiDate(end)}`;
  }
  if (start && end) {
    return `เปิดจองแล้ว วันที่ ${formatThaiDate(start)} ถึง ${formatThaiDate(end)}`;
  }
  return "สถานะการจอง";
}

/* -------------------------------------------------------------------------- */
/*                              React Component                               */
/* -------------------------------------------------------------------------- */

/*
 * คำอธิบาย: CardPackage – การ์ดแสดงข้อมูลแพ็กเกจท่องเที่ยว
 * Input : ดูรายละเอียดในชนิดข้อมูล CardPackageProps
 * Output: JSX.Element – บล็อกการ์ดหนึ่งใบ ใช้ในหน้าแสดงรายการแพ็กเกจ
 */
export default function CardPackage({
  image,
  title,
  location,
  bookingStart,
  bookingEnd,
  bookingStatus = "OPEN",
  statusText,
  booked = 0,
  capacity = 50,
  tags = ["ข้อความ", "ข้อความ", "ข้อความ", "ข้อความ"],
  priceTHB = 0,
  onClick,
  className = "",
}: CardPackageProps): JSX.Element {
  // คำอธิบาย: จัดรูปแบบราคาเป็นสกุลบาท (ไม่แสดงทศนิยม)
  const price = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    currencyDisplay: "code",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(priceTHB);

  // คำอธิบาย: เตรียมวันที่และข้อความสถานะ
  const start = toDate(bookingStart);
  const end = toDate(bookingEnd);
  const computedStatus = buildStatusText(bookingStatus, start, end, statusText);

  // คำอธิบาย: ตั้งค่าสีป้ายตามสถานะ
  const badgeColor =
    bookingStatus === "OPEN"
      ? "bg-emerald-600"
      : bookingStatus === "UPCOMING"
      ? "bg-amber-500"
      : "bg-slate-400";

  return (
    <article
      onClick={onClick}
      className={`relative w-[280px] h-[375px] rounded-2xl border border-slate-200 bg-white 
                  shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow
                  ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {/* รูปภาพหน้าปกแพ็กเกจ */}
      <img src={image} alt={title} className="w-full h-[140px] object-cover" />

      {/* เนื้อหาในส่วนการ์ด */}
      <div className="p-3 pb-10 flex-1 flex flex-col">
        {/* ชื่อแพ็กเกจ: ตัดที่บรรทัด 2 แล้ว ... */}
        <h3 className="text-base font-semibold leading-snug break-words line-clamp-2" title={title}>
          {title}
        </h3>

        {/* ที่ตั้ง: บรรทัดเดียว (ถ้าต้องการ 2 บรรทัด ให้เปลี่ยนเป็น line-clamp-2) */}
        <p className="text-slate-500 text-xs mt-1 break-words line-clamp-1">{location}</p>

        {/* ป้ายสถานะ: บังคับชิดซ้าย, 1 บรรทัด เลื่อนได้เพื่อแสดงข้อความยาวครบ */}
        <div className={`mt-2 rounded-md ${badgeColor} px-2 py-1 text-white text-[10px]`}>
          <div
            className="whitespace-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden text-left"
            title={computedStatus}
            tabIndex={0}
          >
            {computedStatus}
          </div>
        </div>

        {/* จำนวนคนที่จองแล้ว/ความจุ */}
        <p className="mt-2 text-slate-600 text-xs">
          จำนวนคน {booked}/{capacity} จองแล้ว
        </p>

        {/* แท็ก (แสดงสูงสุด 5 อัน) */}
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.slice(0, 5).map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="rounded-xl border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 max-w-[90px] truncate"
              title={t}
            >
              {i === 4 && tags.length > 5 ? "..." : t}
            </span>
          ))}
        </div>
      </div>

      {/* ราคา (มุมซ้ายล่าง) */}
      <div className="absolute bottom-3 left-3 font-semibold text-sm text-slate-900">
        ราคา {price}
      </div>
    </article>
  );
}
