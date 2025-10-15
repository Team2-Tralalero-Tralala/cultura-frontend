/*
 * คำอธิบาย : Component สำหรับ navigation bar (Navbar) มีปุ่มโปรไฟล์และเมนู dropdown ของ Super Admin, Admin และ Member
 * โดยมีการแสดงเมนูต่าง ๆ ใน dropdown ได้แก่ แก้ไขโปรไฟล์, เปลี่ยนรหัสผ่าน และออกจากระบบ
 */

import { useState } from 'react'
import imgUser from '/public/profile.png'

const NavbarSam = () => {
  // State สำหรับจัดการการเปิด-ปิด dropdown
  const [isOpen, setIsOpen] = useState(false)
  // ฟังก์ชันสลับสถานะการเปิด-ปิด dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  return (
    <header className='bg-white'>
      <nav className='flex items-center justify-between px-12 h-16'>

        <div className='relative ml-auto'>
        
          {/* ปุ่มโปรไฟล์ */}
          <button
            onClick={toggleDropdown}
            className="flex items-center justify-between gap-3 p-2"
          >
            <img src={imgUser} className="w-9 h-9 rounded-full" />
            <span className="font-medium text-base">John Doe</span>
          </button>

          {/* Dropdown */}
          {isOpen && (
            <ul className='absolute bg-white rounded-lg w-64 shadow-md p-4 right-0 top-full mt-0 z-10 text-sm'>
              
              {/* แสดงข้อมูล profile */}
              <div className="flex items-center gap-3 mb-3">
                <img src={imgUser} className="w-10 h-10 rounded-full" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium">John Doe</span>
                    <span className="border-blue-400 border-1.8 text-xs bg-blue-100 text-blue-500 font-bold px-2 py-0.5 rounded-md">
                      Super Admin
                    </span>
                  </div>
                  <span className="text-gray-500 text-sm">johndoe@example.com</span>
                </div>
              </div>

              <hr className='border-gray-200 my-2' />

              {/* เมนูใน dropdown */}
              <li className='block py-2 px-2 cursor-pointer hover:bg-gray-100 rounded-md text-base font-medium'>
                แก้ไขโปรไฟล์
              </li>
              <li className='block py-2 px-2 cursor-pointer hover:bg-gray-100 rounded-md text-base font-medium'>
                เปลี่ยนรหัสผ่าน
              </li>
              <hr className='border-gray-200 my-2' />
              <li className='block py-2 px-2 cursor-pointer hover:bg-gray-100 rounded-md text-base font-medium'>
                ออกจากระบบ
              </li>
            </ul>
          )}
        </div>

      </nav>
    </header >
  )
}

export default NavbarSam
