/**
 * Component : Breadcrumb (แบบจดจำเส้นทางด้วย sessionStorage)
 * คำอธิบาย :
 *    Component สำหรับแสดงเส้นทาง (Navigation Path) ของหน้าปัจจุบัน
 *    โดยจะจำลำดับการนำทางของผู้ใช้ภายในระบบแบบอัตโนมัติ
 *    ทำให้สามารถสร้าง breadcrumb ที่ “ถูกต้องตามการคลิกจริง” เช่น
 *    “จัดการชุมชน > Green Village”
 *
 * ตัวอย่าง – หน้ารายการ (มาจาก sidebar) :
 *    <Breadcrumb
 *      current={{
 *        label: "จัดการชุมชน",             //ข้อความที่จะแสดงใน breadcrumb (ชื่อชุมชน)
 *        to: "/super/communities",       //ลิงก์ของหน้าปัจจุบัน ใช้เวลาผู้ใช้กดย้อนจาก breadcrumb
 *        fromSidebar: true,
 *      }}
 *    />
 *
 * ตัวอย่าง – หน้าใน (รายละเอียดชุมชน) :
 *    <Breadcrumb
 *      current={{
 *        label: community.name,                       //ข้อความที่จะแสดงใน breadcrumb (ชื่อชุมชน)
 *        to: `/super/community/${community.id}`,      //ลิงก์ของหน้าปัจจุบัน   //ในหน้า ปกติ “ไม่ต้องใส่ fromSidebar”
 *      }}
 *    />
 *
 *
 */

import { Link, useLocation, useNavigationType } from "react-router-dom";
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
  const navigationType = useNavigationType(); // "PUSH" | "POP" | "REPLACE"
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

    const existedIndex = history.findIndex(
      (h) => h.to === normalizedCurrent.to
    );

    if (!history.length) {
      // ครั้งแรกของ tab นี้ → เริ่มจากหน้าปัจจุบัน
      history = [normalizedCurrent];
    } else if (navigationType === "PUSH") {
      // มาจากการกด Link / navigate ภายในระบบ
      if (
        history.length === 1 &&
        !history[0].fromSidebar && // crumb เดิมไม่ใช่ main จาก sidebar
        existedIndex === -1
      ) {
        // เคสสำคัญ: เข้าหน้า detail ตรง ๆ (history = [detail])
        // แล้วกด Link กลับไปหน้า list → ให้ reset เหลือแค่ list
        history = [normalizedCurrent];
      } else if (existedIndex === -1) {
        // เคสปกติ: list → detail, หรือ detail → หน้าอื่นต่อ
        history.push(normalizedCurrent);
      } else {
        // เคสย้อนกลับมาหน้าเดิมใน chain เดิม (กันซ้อนแปลก ๆ)
        history = history.slice(0, existedIndex + 1);
        history[existedIndex] = normalizedCurrent;
      }
    } else {
      // POP / REPLACE (refresh, back/forward, เปลี่ยน URL ตรง ๆ)
      if (existedIndex === -1) {
        // ไม่มี crumb นี้ใน history → ถือว่าเข้าตรง → เริ่มใหม่จาก current
        history = [normalizedCurrent];
      } else {
        // มีอยู่แล้ว → ตัดให้เหลือถึง crumb นั้น
        history = history.slice(0, existedIndex + 1);
        history[existedIndex] = normalizedCurrent;
      }
    }

    setItems(history);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [location.pathname, navigationType, current]);

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
        const isSingleFromSidebar =
          items.length === 1 && !!item.fromSidebar;

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
