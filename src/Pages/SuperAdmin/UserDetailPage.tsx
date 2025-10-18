/**
 * คำอธิบาย : หน้าแสดงรายละเอียดบัญชีผู้ใช้งาน (User Detail Page)
 * ใช้สำหรับดึงข้อมูลผู้ใช้งานจาก API ผ่าน fetchUserDetail()
 * และแสดงข้อมูลในรูปแบบการ์ด พร้อมปุ่มแก้ไขข้อมูล
 *
 */

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchUserDetail } from "../../Libs/AccountServices";
import { Pencil, SquarePen } from "lucide-react";

/**
 * Page: UserDetailPage
 * วัตถุประสงค์: ใช้แสดงรายละเอียดบัญชีผู้ใช้งานตาม ID ที่ส่งมาจาก URL
 */
export default function UserDetailPage() {
  /** ==============================
   *  🧩 ตัวแปร State และ Routing
   *  ============================== */
  const { id } = useParams<{ id: string }>(); // รับค่า id จาก URL parameter
  const [user, setUser] = useState<any>(null); // เก็บข้อมูลผู้ใช้งาน
  const [loading, setLoading] = useState(true); // สถานะระหว่างโหลดข้อมูล
  const [error, setError] = useState<string | null>(null); // เก็บข้อความ error

  /** ==============================
   *  🔄 useEffect - โหลดข้อมูลผู้ใช้จาก API
   *  ============================== */
  useEffect(() => {
    if (!id) return; // ถ้าไม่มี id ให้หยุด
    (async () => {
      try {
        const data = await fetchUserDetail(Number(id));
        setUser(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /** ==============================
   *  ⚙️ Handling states (loading/error/empty)
   *  ============================== */
  if (loading) return <div className="p-8">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!user) return <div className="p-8">ไม่พบข้อมูลผู้ใช้</div>;

  /** ==============================
   *  🎨 ส่วนแสดงผลหลัก (Main UI)
   *  ============================== */
  return (
    <div className="flex justify-center w-full overflow-hidden">
      <div className="w-full px-4 md:px-0">
        {/* 🧭 หัวข้อหน้า */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-left">รายละเอียดบัญชี</h1>

        {/* 🗂️ การ์ดรายละเอียดผู้ใช้ */}
        <div className="relative bg-white w-full rounded-2xl shadow-md p-6 md:p-10 overflow-hidden">

          {/* ✏️ ปุ่มแก้ไขข้อมูล (มุมขวาบน) */}
          <button
            className="absolute top-5 right-5 inline-flex items-center rounded-md bg-[#104E41] text-white hover:bg-[#0b3a30] transition"
            title="แก้ไขข้อมูล"
          >
            <span className="grid place-items-center h-9 w-9 rounded-md bg-[#0e4739]">
              <SquarePen className="h-5 w-5" strokeWidth={2.1} />
            </span>
            <span className="px-3 text-sm font-medium">แก้ไข</span>
          </button>

          {/* 🧍‍♂️ ส่วนหลักของการ์ด (แบ่งเป็น 2 ฝั่ง: ซ้าย - ขวา) */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-20 mt-10 w-full">

            {/* 🎯 ฝั่งซ้าย: รูปโปรไฟล์ผู้ใช้ */}
            <div className="flex justify-center flex-1">
              <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full bg-gray-200 grid place-items-center text-gray-400 text-7xl font-bold shadow-md">
                {user.profileImage || user.fname?.charAt(0)?.toUpperCase()}

                {/* 🔧 ปุ่มแก้ไขรูปภาพ */}
                <button
                  className="
                    absolute bottom-3 right-3
                    grid place-items-center w-8 h-8
                    rounded-full bg-[#3D4650] text-white
                    ring-2 ring-white shadow-md
                    hover:bg-[#2e343b] transition
                  "
                  title="แก้ไขรูปภาพ"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 📋 ฝั่งขวา: รายละเอียดข้อมูลผู้ใช้ */}
            <div className="flex-1">
              <div className="space-y-2 text-md text-slate-800 leading-6">
                <h2 className="text-lg font-semibold mb-2">รายละเอียดบัญชี</h2>

                {/* 🧾 แสดงข้อมูลผู้ใช้แต่ละฟิลด์ */}
                <p>
                  <span className="font-semibold">ชื่อ - นามสกุล :</span>{" "}
                  {user.fname} {user.lname}
                </p>
                <p>
                  <span className="font-semibold">ชื่อผู้ใช้ :</span>{" "}
                  {user.username}
                </p>
                <p>
                  <span className="font-semibold">อีเมล :</span> {user.email}
                </p>
                <p>
                  <span className="font-semibold">โทรศัพท์ :</span>{" "}
                  {user.phone}
                </p>
                <p>
                  <span className="font-semibold">Role :</span>{" "}
                  {user.role?.name ?? "-"}
                </p>
                <p>
                  <span className="font-semibold">ชุมชนวิสาหกิจ :</span>{" "}
                  {user.memberOf?.name ?? "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
