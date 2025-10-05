/* 
 * คำอธิบาย : Component สำหรับแสดงข้อมูลของแพ็กเกจท่องเที่ยว 
 * เช่น ชื่อแพ็กเกจ, ที่ตั้ง, จำนวนคนจอง, ราคา และแท็กที่เกี่ยวข้อง
 * Input  : Props { image, title, location, statusText, booked, capacity, tags, priceTHB, onClick }
 * Output : การ์ดแสดงข้อมูลที่สามารถคลิกได้
 */

import React, { type JSX } from "react";

type CardPackageProps = {
  image: string;
  title: string;
  location: string;
  statusText?: string;
  booked?: number;
  capacity?: number;
  tags?: string[];
  priceTHB?: number;
  onClick?: () => void;
  className?: string;
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
  const price = new Intl.NumberFormat("th-TH", {
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(priceTHB);

  return (
    <article
      onClick={onClick}
      className={`relative w-[280px] h-[375px] rounded-2xl border border-slate-200 bg-white 
                  shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow
                  ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {/* รูปภาพ */}
      <img src={image} alt={title} className="w-full h-[140px] object-cover" />

      {/* เนื้อหาด้านบน */}
      <div className="p-3 pb-10 flex-1 flex flex-col">
        <h3 className="text-base font-semibold leading-snug line-clamp-2 h-[42px] break-words ">
          {title}
        </h3>

        {/* ที่ตั้ง */}
        <p className="text-slate-500 text-xs mt-1 whitespace-nowrap truncate">{location}</p>

        {/* สถานะการจอง */}
        <span className="mt-2 inline-flex items-center rounded-md bg-emerald-600 px-2 py-1 text-white text-[10px] whitespace-nowrap">
          {statusText}
        </span>

        {/* จำนวนคนจอง */}
        <p className="mt-2 text-slate-600 text-xs">
          จำนวนคน {booked}/{capacity} จองแล้ว
        </p>

        {/* แท็ก */}
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

      {/* ราคา */}
      <div className="absolute bottom-3 left-3 font-semibold text-sm text-slate-900">
        ราคา THB {price}
      </div>
    </article>
  );
}
