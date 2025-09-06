import React, { type JSX } from "react"; //แก้ตรงนี้ แล้วตรงที่แดง JSX หาย
// JSX (JavaScript XML) คือ syntax (รูปแบบการเขียนโค้ด) 
// ที่ทำให้เราเขียนโค้ด React ได้เหมือน HTML 
// แต่จริง ๆ แล้ว JSX ไม่ใช่ HTML

// กำหนด Props ที่การ์ดจะรับเข้ามา
type CardPackageProps = {
  image: string;          // รูปภาพแพ็กเกจ
  title: string;          // ชื่อแพ็กเกจ
  location: string;       // ที่อยู่/ตำแหน่ง
  statusText?: string;    // ข้อความสถานะ (เช่น เปิดจอง)
  booked?: number;        // จำนวนคนที่จองแล้ว
  capacity?: number;      // ความจุทั้งหมด
  tags?: string[];        // แท็กข้อความ
  priceTHB?: number;      // ราคา (บาท)
  onClick?: () => void;   // event เมื่อคลิกทั้งการ์ด
  className?: string;     // ส่งคลาสเพิ่มเติมได้
};

export default function CardPackage({
  image,
  title,
  location,
  statusText = "เปิดจองแพ็กเกจช่วงเวลา",
  booked = 0,
  capacity = 50,
  tags = ["ข้อความ", "ข้อความ", "ข้อความ", "ข้อความ"],
  priceTHB = 0,
  onClick,
  className = "",
}: CardPackageProps): JSX.Element {
  // ฟอร์แมตราคาเป็นสกุลเงินไทย
  const price = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(priceTHB);

// ใช้ type alias แยกสำหรับ props → type CardPackageProps = { ... }

// แล้ว นำมาเป็น type annotation ของพารามิเตอร์แบบ destructuring
// → ({ ... }: CardPackageProps)

// Return type กำหนดชัดเจนเป็น JSX.Element

  return (
    // การ์ดหลัก
    <article
      onClick={onClick}
      className={`w-[274px] h-[375px] rounded-2xl border border-slate-200 bg-white 
                  shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow
                  ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {/* ส่วนรูปภาพด้านบน */}
      <img src={image} alt={title} className="w-full h-[140px] object-cover" />

      {/* ส่วนเนื้อหาของการ์ด */}
      <div className="p-3 flex-1 flex flex-col">
        {/* ชื่อแพ็กเกจ */}
        <h3 className="text-base font-semibold leading-snug">{title}</h3>

        {/* ที่อยู่/ตำแหน่ง */}
        <p className="text-slate-500 text-xs mt-1">{location}</p>

        {/* ป้ายสถานะ */}
        <span className="mt-2 inline-flex items-center rounded-md bg-emerald-600 px-2 py-1 text-white text-xs font-medium">
          {statusText}
        </span>

        {/* จำนวนคนที่จองแล้ว */}
        <p className="mt-2 text-slate-600 text-xs">
          จำนวนคนจอง {booked}/{capacity} จองแล้ว
        </p>

        {/* แท็กข้อความ (เอาแค่ 4 อัน) */}
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.slice(0, 4).map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="rounded-xl border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
            >
              {t}
            </span>
          ))}
        </div>

        {/* ราคา (อยู่ล่างสุดเสมอ เพราะใช้ mt-auto ดันลง) */}
        <div className="mt-auto font-semibold text-sm">ราคา {price}</div>
      </div>
    </article>
  );
}
