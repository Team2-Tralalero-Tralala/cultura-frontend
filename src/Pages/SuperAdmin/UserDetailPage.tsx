/**
 * คำอธิบาย : หน้าแสดงรายละเอียดบัญชีผู้ใช้งาน (User Detail Page)
 * ใช้สำหรับดึงข้อมูลผู้ใช้งานจาก API ผ่าน fetchUserDetail()
 * และแสดงข้อมูลในรูปแบบการ์ด พร้อมปุ่มแก้ไขข้อมูล
 *
 */

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchUserDetail } from "../../Libs/AccountServices";
import { Pencil, SquarePen } from "lucide-react";

/**
 * Page: UserDetailPage
 * วัตถุประสงค์: ใช้แสดงรายละเอียดบัญชีผู้ใช้งานตาม ID ที่ส่งมาจาก URL
 */
export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
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

  if (loading) return <div className="p-8">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!user) return <div className="p-8">ไม่พบข้อมูลผู้ใช้</div>;

  return (
    <div className="flex justify-center w-full ">
      <div className="w-full px-6 md:px-0">
        {/* 🧭 Breadcrumb ด้านบนสุด */}
        <div className="text-base text-gray-600 flex items-center gap-2">
          <Link
            to="/super/accounts"
            className="text-[#4A816F] hover:underline font-medium"
          >
            จัดการบัญชี
          </Link>
          <span className="text-gray-400 text-lg">{">"}</span>
          <span className="text-gray-700">รายละเอียดบัญชี</span>
        </div>

        {/* 🧭 หัวข้อหน้า */}
        <h1 className="text-xl font-semibold text-gray-900">รายละเอียดบัญชี</h1>

        {/* 🗂️ การ์ดรายละเอียดผู้ใช้ */}
        <div className="relative bg-white w-full rounded-2xl shadow-md p-6 md:p-10 mt-2">
          {/* ✏️ ปุ่มแก้ไขข้อมูล (มุมขวาบน) */}
          <button
            className="absolute top-6 right-6 flex items-center gap-3 bg-[#104E41] hover:bg-[#0b3a30] text-white px-6 py-3 rounded-xl transition text-base font-medium"
            title="แก้ไขข้อมูล"
          >
            <SquarePen className="h-5 w-5" strokeWidth={2.1} />
            <span>แก้ไข</span>
          </button>

          {/* 🧍‍♂️ ส่วนหลักของการ์ด */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-24 mt-12 w-full">
            {/* 🎯 ฝั่งซ้าย: รูปโปรไฟล์ผู้ใช้ */}
            <div className="flex justify-center flex-1">
              <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-full bg-gray-200 grid place-items-center text-gray-400 text-8xl font-bold shadow-lg">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  user.fname?.charAt(0)?.toUpperCase()
                )}

                {/* 🔧 ปุ่มแก้ไขรูปภาพ */}
                <button
                  className="
                    absolute bottom-4 right-4
                    grid place-items-center w-10 h-10
                    rounded-full bg-[#3D4650] text-white
                    ring-2 ring-white shadow-md
                    hover:bg-[#2e343b] transition
                  "
                  title="แก้ไขรูปภาพ"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 📋 ฝั่งขวา: รายละเอียดข้อมูลผู้ใช้ */}
            <div className="flex-1">
              <div className="space-y-3 text-lg text-slate-800 leading-relaxed">
                <h2 className="text-xl font-semibold mb-3">
                  รายละเอียดบัญชี
                </h2>

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
