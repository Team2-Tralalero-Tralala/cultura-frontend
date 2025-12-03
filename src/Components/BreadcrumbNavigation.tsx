/**
 * Component : Breadcrumb (แบบจดจำเส้นทางด้วย sessionStorage)
 * คำอธิบาย :
 *    - แสดงเส้นทางของหน้าปัจจุบัน
 *    - จำประวัติการคลิกภายในระบบด้วย sessionStorage
 *    - ถ้าเป็นหน้าที่มาจาก Sidebar (fromSidebar: true) จะ **รีเซ็ต chain ใหม่** ทันที
 *
 * ตัวอย่าง – หน้ารายการ (มาจาก sidebar) :
 *    <Breadcrumb
 *      current={{
 *        label: "จัดการชุมชน",
 *        to: "/super/communities",
 *        fromSidebar: true,   // << สำคัญ : มาจาก sidebar
 *      }}
 *    />
 *
 * ตัวอย่าง – หน้าอื่นๆ ,sub sidebar :
 *    <Breadcrumb
 *      current={{
 *        label: community.name,
 *        to: `/super/community/${community.id}`,
 *      }}
 *    />
 */

import { Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

type Crumb = {
  label: string;
  to: string;
  fromSidebar?: boolean; // true = หน้า main ที่มาจาก sidebar
};

interface BreadcrumbProps {
  /** หน้าปัจจุบัน */
  current: Crumb;
}

const STORAGE_KEY = "breadcrumb_state_final_v2";

export default function Breadcrumb({ current }: BreadcrumbProps) {
  const location = useLocation();
  const [items, setItems] = useState<Crumb[]>([]);

useEffect(() => {
  // ป้องกันกรณี current.to ยังไม่พร้อม หรือเป็น /undefined /null
  const normalizedCurrent: Crumb = {
    ...current,
    to:
      !current.to ||
      current.to.includes("undefined") ||
      current.to.includes("null")
        ? location.pathname
        : current.to,
  };

  let history: Crumb[] = JSON.parse(
    sessionStorage.getItem(STORAGE_KEY) || "[]"
  );

  // ถ้ามาจาก sidebar หลัก → รีเซ็ต chain ใหม่เลย
  if (normalizedCurrent.fromSidebar) {
    history = [normalizedCurrent];
  } else {
    const existedIndex = history.findIndex(
      (h) => h.to === normalizedCurrent.to
    );

    if (!history.length) {
      // ครั้งแรกของ tab นี้ → เริ่มจากหน้าปัจจุบัน
      history = [normalizedCurrent];
    } else if (existedIndex === -1) {
      // ยังไม่เคยมี path นี้ → ต่อท้าย chain
      history.push(normalizedCurrent);
    } else {
      // เคสย้อนกลับมาหน้าเดิมใน chain เดิม
      history = history.slice(0, existedIndex + 1);
      history[existedIndex] = normalizedCurrent;
    }
  }

  setItems(history);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}, [location.pathname, current.label, current.to, current.fromSidebar]);


  const handleBack = (index: number) => {
    const newItems = items.slice(0, index + 1);
    setItems(newItems);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  };

  if (!items.length) return null;

  const lastIndex = items.length - 1;

  return (
    <nav
      aria-label="breadcrumb"
      className="flex items-center text-[14px] font-medium -pt-2 pb-5"
    >
      {items.map((item, index) => {
        const isCurrent = index === lastIndex;
        const isSingleFromSidebar = items.length === 1 && !!item.fromSidebar;

        // กติกาสี:
        // - หน้าเดียว + fromSidebar: ดำ
        // - หน้าปัจจุบัน: #494949
        // - หน้าอื่น ๆ (ก่อนหน้า): ดำ
        const textColorClass = isSingleFromSidebar
          ? "text-black"
          : isCurrent
          ? "text-[#494949]"
          : "text-black";

        return (
          <div key={item.to + index} className="flex items-center">
            {!isCurrent ? (
              <Link
                to={item.to}
                onClick={() => handleBack(index)}
                className={`${textColorClass} hover:text-dark-green transition-colors`}
              >
                {item.label}
              </Link>
            ) : (
              <span className={textColorClass}>{item.label}</span>
            )}

            {index < lastIndex && (
              <Icon
                icon="mdi:chevron-right"
                className="mx-2 text-gray-400 w-3.5 h-3.5"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
