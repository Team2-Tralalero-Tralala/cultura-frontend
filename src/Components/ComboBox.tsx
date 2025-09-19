/* 
 * คำอธิบาย : Component ComboBox สำหรับเลือกข้อมูลจากรายการแบบ dropdown 
 * รองรับการค้นหา, การเลือก, และการแสดงผลแบบ popover
 * ใช้ UI จากไลบรารีภายใน เช่น Button, Command, Popover
 * เหมาะสำหรับเลือกข้อมูล เช่น จังหวัด, หมวดหมู่ เป็นต้น
 */

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

/* 
 * คำอธิบาย : ประเภทของ Props ที่ใช้กับ Component ComboBox
 * title   : string - ชื่อหัวข้อ เช่น "จังหวัด"
 * value   : string - ค่าที่เลือกปัจจุบัน
 * items   : array  - รายการตัวเลือก (value, label)
 * onChange: fn     - Callback เมื่อเปลี่ยนค่า
 * isOpen  : boolean- สถานะเปิด/ปิด popover
 * onOpen  : fn     - Callback เมื่อ popover เปิด
 * onClose : fn     - Callback เมื่อ popover ปิด
 */
type ComboBoxProps = {
  title: string
  value: string
  items: { value: string; label: string }[]
  onChange?: (value: string) => void
  isOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
}

/* 
 * คำอธิบาย : Component Combobox
 * Input : props ตาม ComboBoxProps
 * Output: UI dropdown ที่เลือกค่าได้
 */
export function Combobox({
  title = "",
  value = "",
  items = [],
  onChange = () => {},
  isOpen = false,
  onOpen = () => {},
  onClose = () => {}
}: ComboBoxProps) {
  // State สำหรับควบคุม popover
  const [_open, _setOpen] = React.useState(isOpen)

  // State สำหรับเก็บค่าที่เลือก
  const [_value, _setValue] = React.useState(value)

  /* 
   * คำอธิบาย : ฟังก์ชัน setOpen ใช้เปลี่ยนสถานะ popover 
   * Input : open (boolean) 
   * Output: ไม่มี แต่ trigger callback onOpen/onClose
   */
  const setOpen = (open: boolean) => {
    _setOpen(open)
    if (open) onOpen()
    else onClose()
  }

  /* 
   * คำอธิบาย : ฟังก์ชัน setValue ใช้เปลี่ยนค่าที่เลือก
   * Input : value (string) 
   * Output: ไม่มี แต่ trigger callback onChange
   */
  const setValue = (value: string) => {
    _setValue(value)
    onChange(value)
  }

  // ส่วนแสดงผล UI
  return (
    <Popover open={_open} onOpenChange={setOpen}>
      {/* ปุ่มสำหรับเปิด dropdown */}
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={_open}
          className="w-[200px] justify-between"
        >
          {_value
            ? items.find((item) => item.value === _value)?.label
            : `กรุณาเลือก${title}...`}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      {/* เนื้อหา dropdown */}
      <PopoverContent className="w-[200px] p-0">
        <Command>
          {/* ช่องค้นหา */}
          <CommandInput placeholder={`ค้นหา${title}...`} />
          <CommandList>
            <CommandEmpty>ไม่พบ{title}.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  keywords={[item.label]}
                  onSelect={(currentValue) => {
                    setValue(currentValue === _value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
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
