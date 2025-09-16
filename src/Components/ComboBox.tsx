
// คอมโพเนนต์ ComboBox สำหรับเลือกข้อมูลจากรายการแบบ dropdown
// รองรับการค้นหา, การเลือก, และการแสดงผลแบบ popover
// สามารถกำหนด title, value, items, และ callback ต่าง ๆ ได้
// ใช้ UI จากไลบรารีภายใน เช่น Button, Command, Popover
// เหมาะสำหรับใช้เลือกข้อมูล เช่น จังหวัด, หมวดหมู่ ฯลฯ
"use client"

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import * as React from "react"

import { Button } from "~/Components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/Components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/Components/ui/popover"
import { cn } from "~/lib/utils"



// ประเภทของ props ที่รับเข้า ComboBox
type ComboBoxProps = {
  title: string // ชื่อหัวข้อ เช่น "จังหวัด"
  value: string // ค่าที่เลือกปัจจุบัน
  items: { value: string; label: string }[] // รายการตัวเลือก
  onChange?: (value: string) => void // ฟังก์ชันเมื่อมีการเปลี่ยนค่า
  isOpen?: boolean // สถานะเปิด/ปิด popover
  onOpen?: () => void // ฟังก์ชันเมื่อเปิด popover
  onClose?: () => void // ฟังก์ชันเมื่อปิด popover
}


// ฟังก์ชันหลักของ ComboBox
export function Combobox({
  title = "", // ชื่อหัวข้อที่จะแสดงในปุ่มและช่องค้นหา
  value = "", // ค่าที่เลือกปัจจุบัน
  items = [], // รายการตัวเลือกทั้งหมด
  onChange = () => {}, // ฟังก์ชัน callback เมื่อเปลี่ยนค่า
  isOpen = false, // สถานะเปิด/ปิด popover เริ่มต้น
  onOpen = () => {}, // ฟังก์ชัน callback เมื่อเปิด popover
  onClose = () => {} // ฟังก์ชัน callback เมื่อปิด popover
}: ComboBoxProps) {
  // สถานะภายในสำหรับควบคุม popover และค่าที่เลือก
  const [_open, _setOpen] = React.useState(isOpen)
  const [_value, _setValue] = React.useState(value)

  // ฟังก์ชันเปลี่ยนสถานะเปิด/ปิด popover
  const setOpen = (open: boolean) => {
    _setOpen(open)
    if (open) {
      onOpen()
    } else {
      onClose()
    }
  }

  // ฟังก์ชันเปลี่ยนค่าที่เลือกและเรียก callback
  const setValue = (value: string) => {
    _setValue(value)
    onChange(value)
  }

  // ส่วนแสดงผล UI
  return (
    // Popover สำหรับแสดง dropdown
    <Popover open={_open} onOpenChange={setOpen}>
      {/* ปุ่มสำหรับเปิด dropdown และแสดงค่าที่เลือก */}
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={_open}
          className="w-[200px] justify-between"
        >
          {/* ถ้ามีค่าที่เลือกจะแสดง label ของค่านั้น ถ้าไม่มีก็แสดงข้อความให้เลือก */}
          {_value
            ? items.find((item) => item.value === _value)?.label
            : `กรุณาเลือก${title}...`}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      {/* เนื้อหา dropdown */}
      <PopoverContent className="w-[200px] p-0">
        <Command>
          {/* ช่องค้นหาใน dropdown */}
          <CommandInput placeholder={`ค้นหา${title}...`} />
          <CommandList>
            {/* ถ้าไม่พบข้อมูลจะแสดงข้อความนี้ */}
            <CommandEmpty>ไม่พบ{title}.</CommandEmpty>
            <CommandGroup>
              {/* วนลูปแสดงรายการตัวเลือก */}
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    // เมื่อเลือกตัวเลือก จะเปลี่ยนค่าและปิด dropdown
                    setValue(currentValue === _value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  {/* แสดงไอคอนถูกถ้าค่าตรงกับที่เลือก */}
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      _value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}