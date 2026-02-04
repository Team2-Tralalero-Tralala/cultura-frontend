/*
 * คำอธิบาย : Component Combobox สำหรับการเลือกข้อมูลจากรายการแบบ dropdown
 * รองรับการค้นหาและการแสดงผลด้วย Popover + Command
 * Input : title (string), value (string), items (array of { value, label }), callback (onChange, onOpen, onClose)
 * Output : UI Component ที่ผู้ใช้สามารถค้นหา/เลือกค่าได้
 */
"use client";

import { Icon } from "@iconify/react";
import { CheckIcon } from "lucide-react";
import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/Components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "~/Components/ui/popover";
import { cn } from "@/Libs/Utils";

/*
 * คำอธิบาย : ประเภทของ Props ที่ใช้กับ Combobox
 * - title   : string - ชื่อหัวข้อ เช่น "จังหวัด"
 * - value   : string - ค่าที่ถูกเลือกในปัจจุบัน
 * - items   : array  - รายการตัวเลือกที่ประกอบด้วย value และ label
 * - onChange: fn     - Callback เมื่อค่าเปลี่ยน
 * - isOpen  : boolean - กำหนดสถานะเปิด/ปิด Popover
 * - onOpen  : fn     - Callback เมื่อเปิด Popover
 * - onClose : fn     - Callback เมื่อปิด Popover
 */
type ComboBoxProps = {
  title: string;
  value: string;
  items: { value: string; label: string }[];
  onChange?: (value: string) => void;
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
};

/*
 * คำอธิบาย : ฟังก์ชัน Combobox Component
 * ทำหน้าที่สร้าง UI ของ Combobox ที่สามารถค้นหาและเลือกค่าได้
 */
export function Combobox({
  title = "",
  value = "",
  items = [],
  onChange = () => {},
  isOpen = false,
  onOpen = () => {},
  onClose = () => {},
}: ComboBoxProps) {
  // State สำหรับควบคุมสถานะการเปิด/ปิด Popover
  const [isOpenState, setIsOpenState] = React.useState(isOpen);

  // State สำหรับเก็บค่าที่เลือก
  const [currentValue, setCurrentValue] = React.useState(value);

  // State สำหรับเก็บข้อความที่จะแสดงใน input
  const [currentLabel, setCurrentLabel] = React.useState("");

  /*
   * คำอธิบาย : อัพเดท state currentValue และ currentLabel เมื่อ value หรือ items เปลี่ยน
   * Input : ไม่มี
   * Output : อัพเดท state currentValue และ currentLabel ตามค่า value ที่รับเข้ามา
   */
  React.useEffect(() => {
    setCurrentValue(value);
    if (value) {
      const selectedItem = items.find((item) => item.value === value);
      if (selectedItem) {
        setCurrentLabel(selectedItem.label);
      } else {
        setCurrentLabel("");
      }
    } else {
      setCurrentLabel("");
    }
  }, [value, items]);

  /*
   * คำอธิบาย : ฟังก์ชัน handleSetOpen
   * Input : open (boolean) - สถานะเปิด/ปิด
   * Output : อัปเดต state isOpenState และเรียก onOpen / onClose callback
   */
  const handleSetOpen = (open: boolean) => {
    setIsOpenState(open);
    if (open) onOpen();
    else onClose();
  };

  /*
   * คำอธิบาย : ฟังก์ชัน handleSetValue
   * Input : newValue (string) - ค่าที่เลือก
   * Output : อัปเดต state currentValue และเรียก onChange callback
   */
  const handleSetValue = (newValue: string) => {
    setCurrentValue(newValue);
    onChange(newValue);
  };

  // ส่วนแสดงผล UI หลักของ Combobox
  return (
    <Popover open={isOpenState} onOpenChange={handleSetOpen}>
      <Command>
        <PopoverTrigger>
          <div
            aria-expanded={isOpenState}
            className="flex border justify-between items-center rounded-xl cursor-pointer"
          >
            {/* Input สำหรับค้นหา + ไอคอนแสดงสถานะ */}
            <div className="flex justify-between items-center flex-1 border-r pr-2">
              <CommandInput
                placeholder={`ค้นหา${title}...`}
                value={currentLabel}
                onValueChange={(val) => {
                  setCurrentLabel(val);
                  handleSetOpen(true);
                }}
                onClick={() => handleSetOpen(true)}
              />
              <Icon
                icon={!isOpenState ? "prime:sort-down-fill" : "prime:sort-up-fill"}
                width="24"
                height="24"
                className="opacity-50"
              />
            </div>
            <div className="px-4 h-full">ไป</div>
          </div>
        </PopoverTrigger>

        <PopoverContent className="p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
          <CommandList>
            <CommandEmpty>ไม่พบ{title}.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.label}
                  value={item.value}
                  keywords={[item.label, item.value]}
                  onSelect={() => {
                    handleSetValue(item.value === currentValue ? "" : item.value);
                    setCurrentLabel(item.label === currentLabel ? "" : item.label);
                    handleSetOpen(false);
                  }}
                >
                  {/* แสดง CheckIcon เมื่อค่าถูกเลือก */}
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentValue === item.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="text-center flex-1">{item.label}</div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </PopoverContent>
      </Command>
    </Popover>
  );
}
