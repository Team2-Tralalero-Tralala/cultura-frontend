/**
 * Component : UserDetailPage (Super Admin)
 * Description : แสดงรายละเอียดบัญชีผู้ใช้งานตาม ID ที่ได้รับจาก URL
 * สามารถอัปโหลดรูปโปรไฟล์ใหม่ได้ โดยบันทึกเข้า Database ผ่าน route PUT /super/users/profile/:userId
 */

import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SquarePen } from "lucide-react";

import { fetchUserDetail } from "../../Services/account-services";
import type { UserDetail } from "@/Types/User";
import AvatarUploader from "@/Components/AvatarUploader";

/* ===========================================================
 * Component : UserDetailPage
 * =========================================================== */
export function UserDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /* ===========================================================
   * โหลดข้อมูลผู้ใช้ตาม ID
   * =========================================================== */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await fetchUserDetail(Number(id));
        setUser(data);
      } catch (err: unknown) {
        const e = err as Error;
        setError(e.message || "ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ==========================
  // ฟังก์ชันช่วยแปลง path จาก backend
  // ==========================
  function resolveBackendUploadUrl(fileName?: string): string | undefined {
    if (!fileName) return undefined;

    const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

    // ถ้า path ไม่มีคำว่า "uploads" ให้เติมเอง
    if (!fileName.startsWith("uploads/")) {
      const cleaned = fileName.replace(/^\/+/, ""); // ตัด / หน้าไฟล์ออก
      return `${baseUrl}/uploads/${cleaned}`;
    }

    return `${baseUrl}/${fileName}`;
  }
  /* ===========================================================
   * ฟังก์ชัน: handleAvatarChange
   * คำอธิบาย : เมื่ออัปโหลดรูปใหม่ → ส่งไฟล์ไป backend เพื่ออัปเดต profileImage
   * =========================================================== */
  const handleAvatarChange = async (file: File | null) => {
    if (!id || !file) return;
    const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const res = await fetch(
        `${baseUrl}/api/super/users/profile/${id}`,
        {
          method: "PUT",
          body: formData,
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      // อัปเดตภาพใหม่ใน state
      setUser((prev) =>
        prev ? { ...prev, profileImage: data.data.profileImage } : prev
      );

      alert("อัปโหลดรูปโปรไฟล์สำเร็จ!");
    } catch (err) {
      console.error(err);
      alert("อัปโหลดรูปไม่สำเร็จ");
    }
  };

  /* ===========================================================
   * Render ส่วนแสดงผล
   * =========================================================== */
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
            className="text-gray-900 hover:underline text-sm"
          >
            จัดการบัญชี
          </Link>
          <span className="text-gray-400 text-sm">{">"}</span>
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
              <AvatarUploader
                avatarUrl={resolveBackendUploadUrl(user.profileImage)}
                avatarSize={300}
                onAvatarChange={handleAvatarChange}
              />

            </div>

            {/* รายละเอียดบัญชี */}
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
