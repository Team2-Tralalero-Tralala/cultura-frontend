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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/Components/ui/popover";
import { cn } from "~/lib/utils";

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
    const [_open, _setOpen] = React.useState(isOpen);

    // State สำหรับเก็บค่าที่เลือก
    const [_value, _setValue] = React.useState(value);

    // State สำหรับเก็บข้อความที่จะแสดงใน input
    const [_label, _setLabel] = React.useState("");

    /*
     * คำอธิบาย : ฟังก์ชัน setOpen
     * Input : open (boolean) - สถานะเปิด/ปิด
     * Output : อัปเดต state _open และเรียก onOpen / onClose callback
     */
    const setOpen = (open: boolean) => {
        _setOpen(open);
        if (open) onOpen();
        else onClose();
    };

    /*
     * คำอธิบาย : ฟังก์ชัน setValue
     * Input : value (string) - ค่าที่เลือก
     * Output : อัปเดต state _value และเรียก onChange callback
     */
    const setValue = (value: string) => {
        _setValue(value);
        onChange(value);
    };

    // ส่วนแสดงผล UI หลักของ Combobox
    return (
        <Popover open={_open} onOpenChange={setOpen}>
            <Command>
                <PopoverTrigger>
                    <div
                        aria-expanded={_open}
                        className="flex border justify-between items-center rounded-xl cursor-pointer"
                    >
                        {/* Input สำหรับค้นหา + ไอคอนแสดงสถานะ */}
                        <div className="flex justify-between items-center flex-1 border-r pr-2">
                            <CommandInput
                                placeholder={`ค้นหา${title}...`}
                                value={_label}
                                onValueChange={(val) => {
                                    _setLabel(val);
                                    setOpen(true);
                                }}
                                onClick={() => setOpen(true)}
                            />
                            <Icon
                                icon={
                                    !_open
                                        ? "prime:sort-down-fill"
                                        : "prime:sort-up-fill"
                                }
                                width="24"
                                height="24"
                                className="opacity-50"
                            />
                        </div>
                        <div className="px-4 h-full">ไป</div>
                    </div>
                </PopoverTrigger>

                <PopoverContent
                    className="p-0"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <CommandList>
                        <CommandEmpty>ไม่พบ{title}.</CommandEmpty>
                        <CommandGroup>
                            {items.map((item) => (
                                <CommandItem
                                    key={item.label}
                                    value={item.value}
                                    keywords={[item.label, item.value]}
                                    onSelect={() => {
                                        setValue(
                                            item.value === _value
                                                ? ""
                                                : item.value
                                        );
                                        _setLabel(
                                            item.label === _label
                                                ? ""
                                                : item.label
                                        );
                                        setOpen(false);
                                    }}
                                >
                                    {/* แสดง CheckIcon เมื่อค่าถูกเลือก */}
                                    <CheckIcon
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            _value === item.value
                                                ? "opacity-100"
                                                : "opacity-0"
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
