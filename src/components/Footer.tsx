
export default function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* columns */}
        <div className="flex flex-col gap-8 sm:flex-row sm:gap-24">
          {/* พาร์ทเนอร์ */}
          <div>
            <h3 className="text-lg font-semibold">พาร์ทเนอร์</h3>
            <ul className="mt-2 space-y-2 text-gray-600">
              <li>
                <a href="#" className="hover:text-black">
                  เข้าสู่ระบบวิสาหกิจชุมชน
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  ลงทะเบียนวิสาหกิจชุมชน
                </a>
              </li>
            </ul>
          </div>

          {/* ช่วยเหลือ */}
          <div>
            <h3 className="text-lg font-semibold">ช่วยเหลือ</h3>
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
        <div className="mx-auto max-w-6xl px-6 py-4 text-left text-sm text-gray-700">
          © 2025–Now Cultura. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
