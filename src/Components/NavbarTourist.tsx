{/* navbar ของ tourist ตอนยังไม่login*/ }

import React, { useState } from 'react'

const NavbarTourist = () => {

  // state สำหรับตรวจสอบว่า login แล้วหรือยัง
  const [isAuthen, setIsAuthen] = useState(false);

  // ฟังก์ชันจำลองการ login
  const login = () => {
    setIsAuthen(true);
  }
  // ฟังก์ชันจำลองการ logout
  const logout = () => {
    setIsAuthen(false);
  }

  return (
    <header className='bg-white'>
      <nav className='flex items-center justify-between m-80px px-12  h-16 lg:gab-6'>
        <a href="#">
          <img
            src={"/public/Cultura.png"}
            className="w-40.25 h-7.93"
            alt="Cultura logo"
          />
        </a>

        {/* ใส่กล่องค้นหา */}
        <p >กล่องค้นหา</p>
        <div className="ml-auto flex flex-col items-center gap-6 lg:flex-row lg:gap-6">
          {/* กลุ่มปุ่มทางขวา */}
          {isAuthen ? (
            <div className='relative group'>

              {/* ปุ่มโปรไฟล์ */}
              <button
                className="flex items-center justify-between gap-3
      hover:text-green-500 
      p-2"
              >
                <img src={"/public/profile.png"} className="w-9 h-9" />
                Profile
              </button>

              {/* Dropdown แสดงเมื่อ hover ที่ปุ่ม profile */}
              <ul className='absolute bg-white rounded-lg w-max hidden group-hover:block shadow-md'>
                <li className='block w-max hover:text-green-500 py-2 px-3 cursor-pointer
    hover:text-green-500 '>
                  แก้ไขข้อมูลส่วนตัว
                </li>
                <li className='block w-max hover:text-green-500 py-2 px-3 cursor-pointer
    hover:text-green-500 '>
                  ประวัติการจอง
                </li>
                <li className='block w-max hover:text-green-500 py-2 px-3 cursor-pointer
    hover:text-green-500 '>
                  เปลี่ยนรหัสผ่าน
                </li>
                <li className='block w-max hover:text-green-500 py-2 px-3 cursor-pointer
    hover:text-green-500 '>
                  ดูรายงาน
                </li>

                {/* ปุ่มออกจากระบบ */}
                <li
                  onClick={logout}
                  className='block w-max hover:text-green-500 py-2 px-3 cursor-pointer
    hover:text-green-500 '>
                  ออกจากระบบ
                </li>
              </ul>
            </div>
          ) : (
            // กรณียังไม่ login
            <>
              {/* ปุ่มลงทะเบียน */}
              <button
                className='border-2 px-6 py-1 rounded-full hover:text-green-500 text-base'>
                ลงทะเบียน
              </button>

              {/* ปุ่มเข้าสู่ระบบ */}
              <button
                onClick={login}
                className="bg-[#00BF6A] px-6 py-1.5 rounded-full border-2 border-transparent  hover:text-white text-base">
                เข้าสู่ระบบ
              </button>
            </>
          )}
        </div>

      </nav>
    </header >
  )
}

export default NavbarTourist;
