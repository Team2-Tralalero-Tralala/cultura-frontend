/**
 * Component: UserDetailPage (Super Admin)
 * Description: แสดงรายละเอียดบัญชีผู้ใช้งานตาม ID ที่ได้รับจาก URL
 * หน้านี้ใช้สำหรับดูข้อมูลเท่านั้น (ไม่สามารถอัปโหลดรูปโปรไฟล์ได้)
 */

import type { UserDetail } from "@/Types/User";
import { SquarePen } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchUserDetail } from "../../Services/account-services";

/**
 * Component: UserDetailPage
 * วัตถุประสงค์: แสดงรายละเอียดบัญชีผู้ใช้ (SuperAdmin)
 * Input: userId จาก URL parameter
 * Output: หน้ารายละเอียดผู้ใช้แบบ read-only
 */
export function UserDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /** โหลดข้อมูลผู้ใช้จาก API */
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

  /** แปลง path รูปจาก backend → URL */
  function resolveBackendUploadUrl(fileName?: string): string | undefined {
    if (!fileName) return undefined;
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    const baseUrl = apiUrl.replace("/api", "") || "http://localhost:3000";
    if (!fileName.startsWith("uploads/")) {
      const cleaned = fileName.replace(/^\/+/, "");
      return `${baseUrl}/uploads/${cleaned}`;
    }
    return `${baseUrl}/${fileName}`;
  }

  /** จัดรูปแบบเบอร์โทรศัพท์ ###-###-#### */
  function formatPhoneNumber(phone?: string | null): string {
    if (!phone) return "-";
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  }

  // Section: Loading & Error
  if (loading) return <div className="p-8">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!user) return <div className="p-8">ไม่พบข้อมูลผู้ใช้</div>;

  // Section: Render Layout
  return (
    <div className="flex justify-center w-full">
      <div className="w-full px-6 md:px-0">
        {/* Breadcrumb */}
        <div className="text-base text-gray-600 flex items-center gap-2">
          <Link to="/super/accounts/all" className="text-gray-900 hover:underline text-sm">
            จัดการบัญชี
          </Link>
          <span className="text-gray-400 text-sm">{">"}</span>
          <span>รายละเอียดบัญชี</span>
        </div>

        {/* Header */}
        <h1 className="text-xl font-semibold text-gray-900 mt-1">รายละเอียดบัญชี</h1>

        {/* Card */}
        <div className="relative bg-white w-full rounded-2xl shadow-md p-6 md:p-10 mt-2">
          {/* ปุ่มแก้ไข */}
          <button
            onClick={() => navigate(`/super/account/${user.role.name}/${id}/edit`)}
            className="absolute top-6 right-6 flex items-center gap-3 bg-[#104E41] hover:bg-[#0b3a30] text-white px-6 py-3 rounded-xl transition text-base font-medium"
            title="แก้ไขข้อมูล"
          >
            <SquarePen className="h-5 w-5" strokeWidth={2.1} />
            <span>แก้ไข</span>
          </button>

          {/* Profile + Info */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-24 mt-12 w-full">
            {/* Profile Image */}
            <div className="flex justify-center flex-1">
              {user.profileImage ? (
                <img
                  src={resolveBackendUploadUrl(user.profileImage)}
                  alt="Profile"
                  className="rounded-full object-cover w-[300px] h-[300px] border border-gray-300 shadow-sm"
                />
              ) : (
                <div className="w-[300px] h-[300px] rounded-full bg-gray-200 flex items-center justify-center border border-gray-300 shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-32 h-32 text-gray-400"
                  >
                    <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.9v2.5h19.3v-2.5c0-3.3-6.4-4.9-9.7-4.9z" />
                  </svg>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="space-y-3 text-lg text-slate-800 leading-relaxed">
                <h2 className="text-xl font-semibold mb-3">รายละเอียดบัญชี</h2>

                <p>
                  <span className="font-semibold">ชื่อ - นามสกุล :</span> {user.fname} {user.lname}
                </p>
                <p>
                  <span className="font-semibold">ชื่อผู้ใช้ :</span> {user.username}
                </p>
                <p>
                  <span className="font-semibold">อีเมล :</span> {user.email}
                </p>
                <p>
                  <span className="font-semibold">โทรศัพท์ :</span> {formatPhoneNumber(user.phone)}
                </p>
                <p>
                  <span className="font-semibold">Role :</span> {user.role?.name ?? "-"}
                </p>
                <p>
                  <span className="font-semibold">ชุมชนวิสาหกิจ :</span>{" "}
                  {user.communityAdmin?.[0]?.name ||
                    user.communityMembers?.[0]?.Community?.name ||
                    "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
