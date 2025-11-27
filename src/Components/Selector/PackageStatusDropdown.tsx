// src/Components/PackageStatusDropdown.tsx
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
};

export const PackageStatusDropdown: React.FC<Props> = ({
    value,
    onChange,
    disabled = false,
}) => {
    const [open, setOpen] = React.useState(false);

    const current = STATUS_CONFIG[value];

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
                    <Icon icon={current.icon} width={22} />
                    <span className="text-base font-medium">{current.label}</span>
                </span>

                <Icon
                    icon={open ? "mdi:chevron-up" : "mdi:chevron-down"}
                    width={20}
                />
            </button>

            {/* เมนู */}
            {open && !disabled && (
                <div className="absolute z-30 mt-1 w-[140px] rounded-md border border-gray-300 bg-white shadow-lg overflow-hidden">
                    {(["DRAFT", "PUBLISH", "UNPUBLISH"] as PackageStatus[]).map(
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
