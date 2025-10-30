// src/Components/Selector/CommunityMemberSelector.tsx
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
    member?: Member | null; // ข้อมูล member ที่ถูกเลือก (สำหรับหน้า edit)
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

    const mergedMembers = useMemo(() => {
        if (member) {
            const exists = members.some((m) => m.id === member.id);
            return exists ? members : [member, ...members];
        }
        return members;
    }, [members, member]);

    const selected = mergedMembers.find((m) => m.id === value) || member || null;

    const MIN_QUERY_CHARS = 2;

    // [FIX 1] Effect นี้จะทำงานเมื่อ "communityId" หรือ "inputValue" (ที่ผู้ใช้พิมพ์) เปลี่ยน
    useEffect(() => {
        if (!communityId) {
            setMembers([]);
            return;
        }

        if (debounceRef.current) {
            window.clearTimeout(debounceRef.current);
        }

        debounceRef.current = window.setTimeout(async () => {
            const q = inputValue.trim();

            // [FIX 2] Logic ใหม่:
            // 1. ถ้าพิมพ์ 1 ตัว (q.length === 1) -> ไม่ต้องทำอะไร รอพิมพ์ต่อ
            if (q.length > 0 && q.length < MIN_QUERY_CHARS) {
                return;
            }
            // 2. ถ้า q.length === 0 (โหลดครั้งแรก/ลบหมด) หรือ q.length >= 2 (ค้นหา) -> ให้เรียก API

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
                // ถ้า Error ให้แสดงแค่ตัวที่เลือกไว้ (ถ้ามี)
                setMembers(member ? [member] : []);
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => {
            if (debounceRef.current) {
                window.clearTimeout(debounceRef.current);
            }
        };
    }, [communityId, inputValue, member]); // ⬅️ เรายังต้องใช้ member ที่นี่เผื่อ catch

    // [FIX 3] Effect นี้จะทำงาน "ครั้งเดียว" เพื่อตั้งค่าข้อความเริ่มต้นในช่อง Input
    // (ป้องกันไม่ให้ Autocomplete เติมคำเองในภายหลัง)
    const [isInitialTextSet, setIsInitialTextSet] = useState(false);
    useEffect(() => {
        if (selected && !isInitialTextSet) {
            setInputValue(`${selected.fname} ${selected.lname}`);
            setIsInitialTextSet(true);
        }
    }, [selected, isInitialTextSet]);

    // ... (โค้ด renderCustomInput เหมือนเดิม) ...
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
            filterOptions={(x) => x} // บอก Autocomplete ไม่ต้องกรองเอง
            getOptionLabel={(opt) => (opt ? `${opt.fname} ${opt.lname}` : "")}
            value={selected!}

            // [FIX 4] ควบคุมค่าในช่อง Input ด้วย State ของเรา
            inputValue={inputValue}

            onChange={(_, newValue, reason) => {
                onChange(newValue ? newValue.id : null);
                // [FIX 5] เมื่อผู้ใช้ "เลือก" รายการ ให้เราอัปเดต inputValue ด้วย
                if (reason === 'selectOption' && newValue) {
                    setInputValue(`${newValue.fname} ${newValue.lname}`);
                }
            }}
            onInputChange={(_, newInput, reason) => {
                // [FIX 6] อัปเดต State เฉพาะเมื่อ "ผู้ใช้พิมพ์" หรือ "ผู้ใช้ลบ"
                if (reason === 'input' || reason === 'clear') {
                    setInputValue(newInput);
                }
                // เราจะไม่ setInputValue ถ้า reason เป็น 'reset' (ที่ Autocomplete เติมคำเอง)
            }}
            noOptionsText={communityId ? "ไม่พบสมาชิก" : "โปรดเลือกชุมชนก่อน"}
            renderInput={(params) =>
                renderCustomInput("community-member-selector", "เลือกผู้ดูแล", params)
            }
        />
    );
}

export default CommunityMemberSelector;