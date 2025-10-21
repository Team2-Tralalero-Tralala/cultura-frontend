/**
 * Component : Breadcrumb
 * คำอธิบาย : Component สำหรับแสดงเส้นทางของหน้า (Navigation Path)
 * เช่น "จัดการชุมชน > ภาคตะวันออก > จังหวัดชลบุรี > บ้านท่องเที่ยวเชิงวัฒนธรรม"
 * โดยจะแสดงลูกศร (›) คั่นระหว่างแต่ละลิงก์ และเปลี่ยนสีของข้อความตามสถานะ (ลิงก์ / หน้าปัจจุบัน)
 * 
 * เพิ่มเติม
 * การทำงาน :
 *   - รองรับการส่ง items แบบ array
 *   - ลิงก์ทุกอันก่อนตัวสุดท้ายคลิกได้
 *   - ตัวสุดท้าย (หน้าปัจจุบัน) จะแสดงสีเทาเข้ม (#494949)
 *   - แทรกลูกศร (›) ให้อัตโนมัติทุกชั้น
 * 
 * ตัวอย่างการใช้งาน :
 *   <Breadcrumb
 *     items={[
 *       { label: "จัดการชุมชน", to: "/super/communities" },
 *       { label: "ภาคตะวันออก", to: "/super/communities/region/east" },
 *       { label: "จังหวัดชลบุรี", to: "/super/communities/province/chonburi" },
 *       { label: "บ้านท่องเที่ยวเชิงวัฒนธรรม" },   // ไม่มี to = หน้าปัจจุบัน
 *     ]}
 *   />
 * 
 */

import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";

// กำหนดประเภทข้อมูลของแต่ละ breadcrumb
type Crumb = {
  label: string; // ข้อความที่จะแสดง (Text to display)
  to?: string;   // ลิงก์ (ถ้าไม่มีแสดงว่าเป็นหน้าปัจจุบัน)
};

// Props สำหรับ component หลัก
interface BreadcrumbProps {
  items: Crumb[];
}

// ฟังก์ชันหลักของ Breadcrumb Component
export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav
      aria-label="breadcrumb"
      className="flex items-center text-sm px-6 pt-2 pb-1"
    >
      {/* วน loop แสดงทุก breadcrumb */}
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {/* ถ้ามี to = เป็นลิงก์ (ยังไม่ใช่หน้าปัจจุบัน) */}
          {item.to ? (
            <Link
              to={item.to}
              className="text-black font-medium hover:text-dark-green transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            /* ถ้าไม่มี to = หน้าปัจจุบัน (ตัวสุดท้าย) */
            <span className="text-[#494949] font-medium">{item.label}</span>
          )}

          {/* แสดงไอคอนลูกศรถ้ายังไม่ถึงตัวสุดท้าย */}
          {index < items.length - 1 && (
            <Icon
              icon="mdi:chevron-right"
              className="mx-2 text-gray-400 w-3.5 h-3.5"
            />
          )}
        </div>
      ))}
    </nav>
  );
}
