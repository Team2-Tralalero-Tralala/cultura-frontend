/*
* คำอธิบาย : คอมโพเนนต์ Footer ส่วนท้ายของหน้าเว็บ
* แสดงลิงก์พาร์ทเนอร์/ช่วยเหลือ และข้อความลิขสิทธิ์
* โครงสร้างแบ่งเป็น 2 ส่วนหลัก: คอลัมน์ลิงก์ และแถบลิขสิทธิ์ด้านล่าง
*/

import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto container px-6 py-8">
        {/* columns */}
        <div className="flex flex-col gap-8 sm:flex-row sm:gap-24">
          {/* พาร์ทเนอร์ */}
          <div>
            <h3 className="text-xl font-semibold">พาร์ทเนอร์</h3>
            <ul className="mt-2 space-y-2 text-gray-600">
              <li>
                <Link to="/guest/partner/login" className="hover:text-black">
                  เข้าสู่ระบบวิสาหกิจชุมชน
                </Link>
              </li>
              <li>
                <Link to="/guest/partner/register" className="hover:text-black">
                  ลงทะเบียนวิสาหกิจชุมชน
                </Link>
              </li>
            </ul>
          </div>

          {/* ช่วยเหลือ */}
          <div>
            <h3 className="text-xl font-semibold">ช่วยเหลือ</h3>
            <ul className="mt-2 space-y-2 text-gray-600">
              <li>
                <a href="#" className="hover:text-black">
                  รายละเอียดเบอร์โทร
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* copyright */}
      <div className="border-t">
        <div className="mx-auto container px-6 py-4 text-left text-base text-gray-700">
          © 2025–Now Cultura. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
