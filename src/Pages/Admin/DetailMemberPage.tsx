/**
 * Component: MemberDetailPage (Admin)
 * Description: แสดงรายละเอียดบัญชีผู้ใช้งานตาม ID ที่ได้รับจาก URL
 * หน้านี้ใช้สำหรับดูข้อมูลเท่านั้น (ไม่สามารถอัปโหลดรูปโปรไฟล์ได้)
 */

import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SquarePen, ArrowLeft } from "lucide-react";
import Button from "@/Components/Button";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

import { fetchMemberDetail } from "@/Libs/AccountService";
import type { UserDetail } from "@/Types/User";

/**
 * Component: MemberDetailPage
 * วัตถุประสงค์: แสดงรายละเอียดบัญชีสมาชิกของชุมชน (Admin)
 * Input: userId (ได้จาก useParams)
 * Output: แสดงรายละเอียดบัญชีแบบ read-only
 */
export function MemberDetailPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /** โหลดข้อมูลผู้ใช้จาก API */
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const data = await fetchMemberDetail(Number(userId));
        setUser(data);
      } catch (err: any) {
        console.error("โหลดข้อมูลล้มเหลว:", err);
        const status = err.response?.status;
        if (status === 403 || status === 404) {
          navigate("/admin/members");
        } else {
          setError("ไม่สามารถโหลดข้อมูลได้");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  /** แปลง path รูปจาก backend → URL */
  function resolveBackendUploadUrl(fileName?: string): string | undefined {
    if (!fileName) return undefined;
    const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
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
        <Breadcrumb
          current={{
            label: "รายละเอียดบัญชี",
            to: `/admin/member/${userId}`,
          }}
        />
        <h1 className="flex items-center gap-2 text-[20px] font-bold text-black">
          <ArrowLeft
            className="w-5 h-5 cursor-pointer hover:text-gray-600 transition-colors"
            onClick={() => navigate(-1)}
          />
          รายละเอียดบัญชี
        </h1>

        {/* Card */}
        <div className="relative bg-white w-full rounded-2xl shadow-md p-6 md:p-10 mt-2">
          {/* ส่วนปุ่มจัดการ */}
          <div className="absolute top-6 right-6 flex items-center gap-3">
            {/* ปุ่มแก้ไข */}
            <div className="w-32">
              <Button
                type="confirm-admin"
                onClick={() => navigate(`/admin/members/${userId}/edit`)}
              >
                <div className="flex items-center gap-2">
                  <SquarePen className="h-5 w-5" strokeWidth={2.1} />
                  <span className="text-base">แก้ไข</span>
                </div>
              </Button>
            </div>
          </div>

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
                <h2 className="text-[20px] font-bold text-black mb-3">รายละเอียดบัญชี</h2>

                <p className="text-[16px] text-black font-normal">
                  <span className="font-bold">ชื่อ - นามสกุล :</span> {user.fname} {user.lname}
                </p>
                <p className="text-[16px] text-black font-normal">
                  <span className="font-bold">ชื่อผู้ใช้ :</span> {user.username}
                </p>
                <p className="text-[16px] text-black font-normal">
                  <span className="font-bold">อีเมล :</span> {user.email}
                </p>
                <p className="text-[16px] text-black font-normal">
                  <span className="font-bold">โทรศัพท์ :</span> {formatPhoneNumber(user.phone)}
                </p>
                <p className="text-[16px] text-black font-normal">
                  <span className="font-bold">Role :</span> {user.role?.name ?? "-"}
                </p>
                <p className="text-[16px] text-black font-normal">
                  <span className="font-bold">ชุมชนวิสาหกิจ :</span>{" "}
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
