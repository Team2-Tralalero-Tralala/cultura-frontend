import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

export default function ProfileForm() {
  // input file ref (อนุญาต null)
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [avatar, setAvatar] = useState<string | null>("https://placekitten.com/600/600");

  const inputCls =
    "w-full h-10 rounded-md border border-gray-300 px-3 text-sm " +
    "placeholder:text-gray-400 focus:outline-none focus:ring-2 " +
    "focus:ring-emerald-600/30 focus:border-emerald-600";

  const pick = () => fileRef.current?.click();

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);

    // คืนค่า blob เก่าก่อน (กัน memory leak)
    setAvatar((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
  };

  // cleanup ตอน unmount
  useEffect(() => {
    return () => {
      if (avatar && avatar.startsWith("blob:")) URL.revokeObjectURL(avatar);
    };
  }, [avatar]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    console.log("submit", data);
    alert("บันทึกสำเร็จ (ดูข้อมูลใน console)");
  };

  return (
    <div className="min-h-screen bg-neutral-200">
      <div className="max-w-6xl mx-auto px-5 py-6">
        {/* breadcrumb */}
        <div className="text-sm text-gray-500 mb-3">
          หน้าแรก <span className="mx-1">›</span> แก้ไขข้อมูลส่วนตัว
        </div>

        {/* card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {/* หัวข้อ 2 บรรทัดให้เหมือนภาพ */}
          <h1 className="text-[22px] font-semibold leading-tight -mb-0.5">ตั้งค่าโปรไฟล์</h1>
          <p className="text-[22px] font-semibold text-gray-600 mb-6">Tralalero Tralala</p>

          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* avatar */}
            <div className="flex md:block justify-center">
              <div className="relative w-48 h-48">
                {/* วงกลมชั้นใน: ครอบรูป + overflow-hidden */}
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 ring-1 ring-black/5">
                  <img
                    src={avatar ?? "https://placekitten.com/600/600"}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* ปุ่มดินสออยู่ชั้นนอก ไม่โดนตัดขอบ */}
                <button
                  type="button"
                  onClick={pick}
                  title="อัปโหลดรูป"
                  className="absolute -bottom-1 -right-1 grid place-items-center w-8 h-8
                             rounded-full bg-white text-gray-700 shadow ring-1 ring-black/10"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm2.92 1.33H5v-.92L14.06 7.52l.92.92L5.92 18.58ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z" />
                  </svg>
                </button>

                {/* input ไฟล์ซ่อน */}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  name="avatar"
                  onChange={onFile}
                  className="hidden"
                />
              </div>
            </div>

            {/* fields */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">ชื่อ (ไม่ต้องใส่คำนำหน้า)</label>
                <input className={inputCls} name="firstName" placeholder="Tralalero" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">นามสกุล</label>
                <input className={inputCls} name="lastName" placeholder="Tralala" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">ชื่อผู้ใช้</label>
                <input className={inputCls} name="username" placeholder="Tralalero Tralala" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">อีเมล</label>
                <input type="email" className={inputCls} name="email" placeholder="tralalero@tralala.com" />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">หมายเลขโทรศัพท์</label>
                <input className={inputCls} name="phone" placeholder="012-345-789" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">อายุ</label>
                <input type="number" min={0} className={inputCls} name="age" placeholder="80" />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">วัน-เดือน-ปีเกิด</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                      <path d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2zm13 6H4v12h16V8z" />
                    </svg>
                  </span>
                  <input type="date" className={`${inputCls} pl-9`} name="dob" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">เพศ</label>
                <div className="flex items-center gap-6 h-10">
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="gender" value="male" /> ชาย
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="gender" value="female" /> หญิง
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="gender" value="na" defaultChecked /> ไม่ระบุ
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">จังหวัด</label>
                <input className={inputCls} name="province" placeholder="ชลบุรี" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">อำเภอ/เขต</label>
                <input className={inputCls} name="district" placeholder="เมืองชลบุรี" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">ตำบล/แขวง</label>
                <input className={inputCls} name="subdistrict" placeholder="แสนสุข" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">ไปรษณีย์</label>
                <input className={inputCls} name="postal" placeholder="20130" />
              </div>

              {/* actions */}
              <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="rounded-xl bg-gray-200 text-gray-700 px-6 py-2 shadow-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-700 text-white px-6 py-2 shadow-sm hover:bg-emerald-800"
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
