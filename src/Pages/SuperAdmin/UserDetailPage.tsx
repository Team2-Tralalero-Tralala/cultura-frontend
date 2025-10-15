import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchUserDetail } from "../../Services/user-services";
import { Pencil } from "lucide-react";

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
    <div className="fflex justify-center w-full min-h-screen bg-gray-50 py-10">
      {/* h1 */}
      <div className="w-full px-10">
        {/* หัวข้อด้านบนการ์ด */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-left">
          รายละเอียดบัญชี
        </h1>

        {/* การ์ดหลัก */}
        <div className="bg-white w-full h-[50vh] rounded-2xl shadow-lg p-10 relative flex flex-col items-center overflow-auto">
          {/* ปุ่มแก้ไขมุมขวาบน */}
          <button className="absolute top-6 right-6 flex items-center gap-2 bg-dark-green text-white px-6 py-2 rounded-lg hover:bg-green-700">
            <Pencil className="w-5 h-5" />
            <span>แก้ไข</span>
          </button>

          {/* เนื้อหาหลัก */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-16 mt-6 w-full">
            {/* ฝั่งซ้าย: Avatar */}
            <div className="relative flex justify-center flex-1">
              <div className="w-52 h-52 md:w-60 md:h-60 rounded-full bg-gray-200 grid place-items-center text-gray-400 text-7xl font-bold shadow-sm">
                {user.fname?.charAt(0) || "?"}
              </div>
              <button className="absolute bottom-4 right-[calc(50%-5rem)] bg-white p-3 rounded-full shadow hover:bg-gray-100">
                <Pencil className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* ฝั่งขวา: รายละเอียดบัญชี */}
            <div className="flex-1 flex justify-start">
              <div className="space-y-3 text-base text-slate-800 leading-relaxed">
                <h2 className="text-xl font-semibold mb-2">รายละเอียดบัญชี</h2>
                <p><strong>ชื่อ - นามสกุล :</strong> {user.fname} {user.lname}</p>
                <p><strong>ชื่อผู้ใช้ :</strong> {user.username}</p>
                <p><strong>อีเมล :</strong> {user.email}</p>
                <p><strong>โทรศัพท์ :</strong> {user.phone}</p>
                <p><strong>Role :</strong> {user.role?.name ?? "-"}</p>
                <p><strong>ชุมชนวิสาหกิจ :</strong> {user.memberOf?.name ?? "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}