/**
 * Component : Breadcrumb
 * คำอธิบาย : Component สำหรับแสดงเส้นทางของหน้าปัจจุบัน (Breadcrumb Navigation)
 * โดยมีการจดจำประวัติการเข้าชมด้วย sessionStorage และใช้ Snapshot Strategy
 * เพื่อป้องกันปัญหาการเข้า URL ตรง หรือการกดปุ่ม Back ของ Browser
 *
 */

import { Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

/**
 * Type: Crumb
 * วัตถุประสงค์: โครงสร้างข้อมูลของแต่ละ Breadcrumb Node
 */
type Crumb = {
  label: string;
  to: string;
  isFromSidebar?: boolean; // Renamed from fromSidebar
};

interface BreadcrumbNavigationProps {
  current: Crumb;
}

// Config Constants
const SNAPSHOT_KEY = "breadcrumb_snapshots_v2";
const LAST_CHAIN_KEY = "breadcrumb_last_active_v2";

/**
 * ฟังก์ชัน: getRolePrefix
 * วัตถุประสงค์: ดึงส่วนแรกของ URL เพื่อระบุ Role ของผู้ใช้ (เช่น /super/... -> super)
 * Input:
 *   - path: URL path (string)
 * Output:
 *   - Role prefix (string)
 */
const getRolePrefix = (path: string) => {
  const parts = path.split("/").filter(Boolean);
  return parts.length > 0 ? parts[0] : "";
};

/**
 * คำอธิบาย : สร้างและจัดการแถบนำทาง Breadcrumb ตามประวัติการเข้าชม
 * Input : current (ข้อมูลของหน้าปัจจุบัน: label, to, fromSidebar)
 * Output : JSX Element ของ Breadcrumb nav หรือ null
 */
export default function BreadcrumbNavigation({ current }: BreadcrumbNavigationProps) {
  const location = useLocation();

  const [items, setItems] = useState<Crumb[]>([]);

  useEffect(() => {
    const normalizedCurrent: Crumb = {
      ...current,
      to:
        !current.to || current.to.includes("undefined") || current.to.includes("null")
          ? location.pathname
          : current.to,
    };

    const snapshots: Record<string, Crumb[]> = JSON.parse(
      sessionStorage.getItem(SNAPSHOT_KEY) || "{}",
    );
    let lastActiveChain: Crumb[] = JSON.parse(sessionStorage.getItem(LAST_CHAIN_KEY) || "[]");

    const currentKey = location.key;
    const isFirstLoad = currentKey === "default";
    let newChain: Crumb[] = [];

    const currentRole = getRolePrefix(normalizedCurrent.to);
    const lastChainRole =
      lastActiveChain.length > 0 ? getRolePrefix(lastActiveChain[0].to) : currentRole;

    // ตรวจสอบว่า Role เปลี่ยนไปหรือไม่ (เช่น Logout admin -> Login tourist)
    const isRoleMismatch = currentRole !== lastChainRole;

    // Priority 1: ถ้ามาจาก Sidebar หรือ Role เปลี่ยน -> ล้างกระดานทันที
    if (normalizedCurrent.isFromSidebar || isRoleMismatch) {
      newChain = [normalizedCurrent];
    }
    // Priority 2: ถ้ามี Snapshot ของ Key นี้ -> ลอง Restore
    else if (snapshots[currentKey]) {
      const restoredChain = snapshots[currentKey];
      const lastItem = restoredChain[restoredChain.length - 1];

      // Sanity Check: Snapshot ที่ดึงมา ปลายทางต้องตรง และ Role ต้องไม่เปลี่ยน
      if (
        lastItem &&
        lastItem.to === normalizedCurrent.to &&
        getRolePrefix(lastItem.to) === currentRole
      ) {
        newChain = restoredChain;
      } else {
        // ถ้าไม่ตรง หรือ Role เปลี่ยน แสดงว่าเป็นขยะ -> Reset ใหม่
        newChain = [normalizedCurrent];
      }
    }
    // Priority 3: กรณีอื่นๆ (กด Link ต่อมา, First Load ที่ไม่มี Snap)
    else {
      if (isFirstLoad) {
        newChain = [normalizedCurrent];
      } else {
        // Logic การต่อ Chain ปกติ
        const existedIndex = lastActiveChain.findIndex(
          (historyItem) => historyItem.to === normalizedCurrent.to,
        );

        if (existedIndex !== -1) {
          newChain = lastActiveChain.slice(0, existedIndex + 1);
          newChain[existedIndex] = normalizedCurrent;
        } else {
          newChain = [...lastActiveChain, normalizedCurrent];
        }
      }
    }

    // Save States
    snapshots[currentKey] = newChain;
    sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshots));
    sessionStorage.setItem(LAST_CHAIN_KEY, JSON.stringify(newChain));

    setItems(newChain);
  }, [location.pathname, location.key, current.label, current.to, current.isFromSidebar]);

  /**
   * คำอธิบาย : ฟังก์ชันสำหรับจัดการ event เมื่อกดลิงก์ย้อนกลับ (ปัจจุบันยังไม่มี logic พิเศษ)
   * Input : -
   * Output : -
   */
  const handleBack = () => {};

  if (!items.length) return null;

  const lastIndex = items.length - 1;

  return (
    <nav aria-label="breadcrumb" className="flex items-center text-[14px] font-medium -pt-2 pb-5">
      {items.map((item, index) => {
        const isCurrent = index === lastIndex;
        const isSingleFromSidebar = items.length === 1 && !!item.isFromSidebar;
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
                onClick={handleBack}
                className={`${textColorClass} hover:text-dark-green transition-colors`}
              >
                {item.label}
              </Link>
            ) : (
              <span className={textColorClass}>{item.label}</span>
            )}
            {index < lastIndex && (
              <Icon icon="mdi:chevron-right" className="mx-2 text-gray-400 w-3.5 h-3.5" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
