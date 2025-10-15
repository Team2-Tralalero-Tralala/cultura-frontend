/*
 * คำอธิบาย : Component สำหรับ navigation bar (Navbar) มีปุ่มโปรไฟล์และเมนู dropdown ของ ผู้ใช้ทั่วไป (Tourist)
 * โดยมีการแสดงเมนูต่าง ๆ ใน dropdown ได้แก่ แก้ไขข้อมูลส่วนตัว, ประวัติการจอง, เปลี่ยนรหัสผ่าน, ดูรายงาน และออกจากระบบ
 */

import React, { useState } from 'react'

const NavbarTourist = () => {
  // State สำหรับจัดการการเข้าสู่ระบบ
  const [isAuthen, setIsAuthen] = useState(false); 
  // State สำหรับจัดการการเปิด-ปิด dropdown
  const [isOpen, setIsOpen] = useState(false);        

  // ฟังก์ชันสำหรับเข้าสู่ระบบและออกจากระบบ
  const login = () => {
    setIsAuthen(true);
  }
  const logout = () => {
    setIsAuthen(false);
    setIsOpen(false); // ปิด dropdown ตอน logout
  }

  // ฟังก์ชันสลับสถานะการเปิด-ปิด dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  }

  return (
    <header className='bg-white'>
      <nav className='flex items-center justify-between m-80px px-12 h-16 lg:gab-6'>

        <a href="#">
          <img
            src={"/public/Cultura.png"}
            className="w-40.25 h-7.93"
            alt="Cultura logo"
          />
        </a>

        {/* กล่องค้นหา */}
        <p>กล่องค้นหา</p>

        <div className="ml-auto flex flex-col items-center gap-6 lg:flex-row lg:gap-6">
          {isAuthen ? (
            <div className='relative'>

              {/* ปุ่มโปรไฟล์ */}
              <button
                onClick={toggleDropdown}
                className="flex items-center justify-between gap-3 hover:text-green-500 p-2"
              >
                <img src={"/public/profile.png"} className="w-9 h-9" />
                Profile
              </button>

              {/* Dropdown แสดงเมื่อคลิก */}
              {isOpen && (
                <ul className='absolute bg-white rounded-lg w-max shadow-md mt-2 z-10'>
                  <li className='block w-max hover:text-green-500 py-2 px-3 cursor-pointer'>
                    แก้ไขข้อมูลส่วนตัว
                  </li>
                  <li className='block w-max hover:text-green-500 py-2 px-3 cursor-pointer'>
                    ประวัติการจอง
                  </li>
                  <li className='block w-max hover:text-green-500 py-2 px-3 cursor-pointer'>
                    เปลี่ยนรหัสผ่าน
                  </li>
                  <li className='block w-max hover:text-green-500 py-2 px-3 cursor-pointer'>
                    ดูรายงาน
                  </li>
                  <li
                    onClick={logout}
                    className='block w-max hover:text-green-500 py-2 px-3 cursor-pointer'
                  >
                    ออกจากระบบ
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <>
              <button
                className='border-2 px-6 py-1 rounded-full hover:text-green-500 text-base'>
                ลงทะเบียน
              </button>

              <button
                onClick={login}
                className="bg-[#00BF6A] px-6 py-1.5 rounded-full border-2 border-transparent hover:text-white text-base">
                เข้าสู่ระบบ
              </button>
            </>
          )}
        </div>

      </nav>
    </header>
  )
}

export default NavbarTourist
