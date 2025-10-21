// src/Components/Selector/CommunityMemberSelector.tsx
/**
 * เลือก "สมาชิกผู้ดูแลแพ็กเกจ" ภายในชุมชนที่กำหนด
 * - ใช้ MUI Autocomplete
 * - debounce ค้นหาตามชื่อ
 * - รวมสมาชิกที่ส่งเข้ามา (member ปัจจุบัน) ลงใน options โดยไม่ซ้ำ
 *
 * Props:
 *  - communityId: number | undefined   // ชุมชนที่ต้องการดึงสมาชิก
 *  - value?: number                    // id ของสมาชิกที่เลือกอยู่
 *  - member?: Member | null            // ข้อมูลสมาชิกปัจจุบัน (กรณีแก้ไข)
 *  - onChange: (value: number | null) => void
 *  - error?: boolean
 *  - helperText?: string
 *  - disabled?: boolean
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import { getCommunityMembers } from "@/Libs/CommunityService";

export interface Member {
    id: number;
    fname: string;
    lname: string;
}

interface CommunityMemberSelectorProps {
    communityId?: number;
    value?: number;
    member?: Member | null;
    onChange: (value: number | null) => void;
    error?: boolean;
    helperText?: string;
    disabled?: boolean;
}

export function CommunityMemberSelector({
    communityId,
    value,
    member,
    onChange,
    error = false,
    helperText = "",
    disabled = false,
}: CommunityMemberSelectorProps) {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>("");
    const debounceRef = useRef<number | null>(null);

    // รวม member ปัจจุบันเข้า options โดยไม่ซ้ำ
    const mergedMembers = useMemo(() => {
        if (member) {
            const exists = members.some((m) => m.id === member.id);
            return exists ? members : [member, ...members];
        }
        return members;
    }, [members, member]);

    // ค่าที่เลือกอยู่
    const selected = mergedMembers.find((m) => m.id === value) || member || null;

    const MIN_QUERY_CHARS = 2;

    useEffect(() => {
        if (!communityId) {
            setMembers([]);
            return;
        }

        if (debounceRef.current) {
            window.clearTimeout(debounceRef.current);
            debounceRef.current = null;
        }

        debounceRef.current = window.setTimeout(async () => {
            const q = inputValue.trim();
            if (q.length < MIN_QUERY_CHARS) {
                setMembers(member ? [member] : []);
                return;
            }

            try {
                setLoading(true);
                const res = await getCommunityMembers(communityId, { q, limit: 20 });
                const raw = res?.data?.data ?? [];
                const list: Member[] = (Array.isArray(raw) ? raw : []).map((m: any) => ({
                    id: Number(m.id),
                    fname: m.fname ?? "",
                    lname: m.lname ?? "",
                }));
                setMembers(list);
            } catch {
                setMembers(member ? [member] : []);
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => {
            if (debounceRef.current) {
                window.clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
        };
    }, [communityId, inputValue, member]);

    // Input renderer (เหมือนตัวอย่าง)
    const renderCustomInput = (id: string, label: string, params: any) => {
        const { InputProps, inputProps } = params;
        return (
            <div ref={InputProps.ref} className="w-full">
                <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor={id} className="block text-base font-semibold text-gray-800">
                        {label} <span className="text-red-600">*</span>
                    </label>
                    {error && (
                        <span id={`${id}-helper-text`} className="text-xs text-red-600 ml-2 whitespace-nowrap">
                            {helperText}
                        </span>
                    )}
                </div>
                <div className="relative">
                    <input
                        {...inputProps}
                        id={id}
                        type="text"
                        placeholder={communityId ? label : "โปรดเลือกชุมชนก่อน"}
                        disabled={disabled || !communityId}
                        className={`block w-full rounded-form border px-4 py-2 text-base text-gray-900 placeholder:text-gray-500 leading-relaxed transition-shadow outline-none
              ${error
                                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-400"
                                : "border-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-400"
                            } ${disabled || !communityId ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                    />
                    {InputProps.endAdornment && (
                        <div className="absolute inset-y-0 right-2 flex items-center">{InputProps.endAdornment}</div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Autocomplete
            id="community-member-selector"
            disablePortal
            disableClearable
            loading={loading}
            options={mergedMembers}
            getOptionLabel={(opt) => (opt ? `${opt.fname} ${opt.lname}` : "")}
            value={selected!}
            onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
            onInputChange={(_, newInput) => setInputValue(newInput)}
            noOptionsText={communityId ? "ไม่พบสมาชิก" : "โปรดเลือกชุมชนก่อน"}
            renderInput={(params) =>
                renderCustomInput("community-member-selector", "เลือกผู้ดูแล", params)
            }
        />
    );
}

export default CommunityMemberSelector;
