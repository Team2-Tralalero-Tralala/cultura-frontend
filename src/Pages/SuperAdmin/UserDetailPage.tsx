/**
 * Component : UserDetailPage (Super Admin)
 * Description : แสดงรายละเอียดบัญชีผู้ใช้งานตาม ID ที่ได้รับจาก URL
 * ใช้ดึงข้อมูลจาก API ผ่าน fetchUserDetail() และแสดงผลในรูปแบบการ์ด
 */

import { useParams, Link, useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import { Pencil, SquarePen } from "lucide-react";

import { fetchUserDetail } from "../../Libs/AccountServices";
import type { UserDetail } from "@/Types/User";

/* ===========================================================
 * Component : UserDetailPage
 * =========================================================== */
export function UserDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /* 
   * ฟังก์ชัน: useEffect โหลดข้อมูลผู้ใช้
   * คำอธิบาย: ดึงรายละเอียดบัญชีจาก API ตาม ID ที่รับจาก URL
   */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await fetchUserDetail(Number(id));
        setUser(data);
      } catch (err: unknown) {
        const e = err as Error;
        setError((e as any)?.message || "ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-8">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!user) return <div className="p-8">ไม่พบข้อมูลผู้ใช้</div>;

  return (
    <div className="flex justify-center w-full">
      <div className="w-full px-6 md:px-0">
        {/* Breadcrumb */}
        <div className="text-base text-gray-600 flex items-center gap-2">
          <Link
            to="/super/accounts"
            className="text-gray-900 hover:underline font-medium"
          >
            จัดการบัญชี
          </Link>
          <span className="text-gray-400 text-lg">{">"}</span>
          <span>รายละเอียดบัญชี</span>
        </div>

        {/* Header */}
        <h1 className="text-xl font-semibold text-gray-900 mt-1">
          รายละเอียดบัญชี
        </h1>

        {/* Card */}
        <div className="relative bg-white w-full rounded-2xl shadow-md p-6 md:p-10 mt-2">
          {/* ปุ่มแก้ไขข้อมูล */}
          <button
            onClick={() => navigate(`/super/account/edit/${id}`)}
            className="absolute top-6 right-6 flex items-center gap-3 bg-[#104E41] hover:bg-[#0b3a30] text-white px-6 py-3 rounded-xl transition text-base font-medium"
            title="แก้ไขข้อมูล"
          >
            <SquarePen className="h-5 w-5" strokeWidth={2.1} />
            <span>แก้ไข</span>
          </button>

          {/* เนื้อหา */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-24 mt-12 w-full">
            {/* รูปโปรไฟล์ */}
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
                {/* ปุ่มแก้ไขรูปภาพ */}
                <button
                  className="absolute bottom-4 right-4 grid place-items-center w-10 h-10 rounded-full bg-[#3D4650] text-white ring-2 ring-white shadow-md hover:bg-[#2e343b] transition"
                  title="แก้ไขรูปภาพ"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* รายละเอียด */}
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
