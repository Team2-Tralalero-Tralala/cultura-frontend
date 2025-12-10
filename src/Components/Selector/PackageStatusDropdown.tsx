/**
 * คำอธิบาย : Component สำหรับ Dropdown เลือกสถานะของ Package (Draft, Publish, Unpublish)
 */
import React from "react";
import { Icon } from "@iconify/react";

export type PackageStatus = "DRAFT" | "PUBLISH" | "UNPUBLISH";

const STATUS_CONFIG: Record<
    PackageStatus,
    { label: string; icon: string }
> = {
    DRAFT: {
        label: "ฉบับร่าง",
        icon: "material-symbols:draft",
    },
    PUBLISH: {
        label: "เผยแพร่",
        icon: "icon-park-outline:earth",
    },
    UNPUBLISH: {
        label: "ไม่เผยแพร่",
        icon: "si:lock-fill",
    },
};

type Props = {
    value: PackageStatus;
    onChange: (value: PackageStatus) => void;
    disabled?: boolean;
    exclude?: PackageStatus[];
};

/*
 * คำอธิบาย : ฟังก์ชัน Component สำหรับแสดงผลและจัดการการเลือกสถานะของแพ็กเกจ
 * Input: props (Props) - ข้อมูลที่รับเข้ามา ได้แก่ value (สถานะปัจจุบัน), onChange (ฟังก์ชันเปลี่ยนสถานะ), disabled (สถานะการปิดใช้งาน)
 * Output : JSX.Element (ส่วนแสดงผล Dropdown)
 */
export const PackageStatusDropdown: React.FC<Props> = ({
    value,
    onChange,
    disabled = false,
    exclude = [],
}) => {
    const [isOpen, setOpen] = React.useState(false);
    const currentStatusConfig = STATUS_CONFIG[value];

    /* * คำอธิบาย : ฟังก์ชันสำหรับเลือกสถานะและปิด Dropdown
     * Input: status (PackageStatus) - สถานะที่ผู้ใช้เลือก
     * Output: -
     */
    const handleSelect = (status: PackageStatus) => {
        if (disabled) return;
        onChange(status);
        setOpen(false);
    };

    return (
        <div className="relative inline-block text-left">
            {/* ปุ่มหลัก */}
            <button
                type="button"
                disabled={disabled}
                className={`flex w-[150px] items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm ${disabled ? "cursor-not-allowed opacity-60" : "hover:bg-gray-50"
                    }`}
                onClick={() => !disabled && setOpen((prev) => !prev)}
            >
                <span className="flex items-center gap-2">
                    <Icon icon={currentStatusConfig.icon} width={22} />
                    <span className="text-base font-medium">{currentStatusConfig.label}</span>
                </span>

                <Icon
                    icon={isOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
                    width={20}
                />
            </button>

            {/* เมนู */}
            {isOpen && !disabled && (
                <div className="absolute z-30 mt-1 w-[140px] rounded-md border border-gray-300 bg-white shadow-lg overflow-hidden">
                    {(["DRAFT", "PUBLISH", "UNPUBLISH"] as PackageStatus[])
                        .filter((status) => !exclude.includes(status))
                        .map(
                            (status) => {
                                const config = STATUS_CONFIG[status];
                                return (
                                    <button
                                        key={status}
                                        type="button"
                                        className={`
              flex w-full items-center gap-3 px-3 py-2 text-left
              hover:bg-gray-100
              ${status === value ? "bg-gray-50" : ""}
              whitespace-nowrap
              rounded-none
            `}
                                        onClick={() => handleSelect(status)}
                                    >
                                        <Icon icon={config.icon} width={22} />
                                        <span className="text-base leading-none">
                                            {config.label}
                                        </span>
                                    </button>
                                );
                            },
                        )}
                </div>
            )}
        </div>
    );
};

export default PackageStatusDropdown;
