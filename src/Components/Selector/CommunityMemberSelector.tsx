// src/Components/Selector/CommunityMemberSelector.tsx
import { useEffect, useState } from "react";
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

    // [FIX] หาค่าที่เลือกจาก 'members' (ผลลัพธ์ API)
    // แต่ถ้ายังโหลด/ไม่มีใน 'members' ให้ใช้ 'member' (prop) ที่ส่งมาจากหน้า Edit
    const selected = members.find((m) => m.id === value) || member || null;

    // [FIX] แก้ไข useEffect ให้โหลดข้อมูล "ทั้งหมด" "ครั้งเดียว"
    // เมื่อ communityId เปลี่ยนแปลง (ลบ inputValue ออกจาก dependency array)
    useEffect(() => {
        if (!communityId) {
            setMembers([]);
            return;
        }

        let mounted = true;
        const fetchAllMembers = async () => {
            try {
                setLoading(true);
                // เรียก API โดยไม่ส่ง 'q' เพื่อเอาสมาชิกทั้งหมด (หรือเพิ่ม limit ให้สูงๆ)
                const res = await getCommunityMembers(communityId, { limit: 500 });
                if (!mounted) return;

                const raw = res?.data?.data ?? [];
                const list: Member[] = (Array.isArray(raw) ? raw : []).map((m: any) => ({
                    id: Number(m.id),
                    fname: m.fname ?? "",
                    lname: m.lname ?? "",
                }));

                // ตรวจสอบว่า 'member' (prop) ที่ถูกเลือกไว้ มีอยู่ใน list หรือไม่
                if (member && !list.some(m => m.id === member.id)) {
                    // ถ้าไม่มี ให้เพิ่มเข้าไปใน list เพื่อให้แสดงผลถูกต้อง
                    setMembers([member, ...list]);
                } else {
                    setMembers(list);
                }
            } catch {
                if (!mounted) return;
                // ถ้า API พัง อย่างน้อยก็แสดง 'member' ที่ถูกเลือกไว้
                setMembers(member ? [member] : []);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchAllMembers();

        return () => {
            mounted = false;
        };
    }, [communityId, member]); // <-- [FIX] เอา inputValue ออก

    // [FIX] Effect นี้ยังคงมีประโยชน์ (ตั้งค่าข้อความเริ่มต้น)
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
            options={members} // [FIX] ใช้ 'members' (ที่เป็น list เต็ม)

            // [FIX] ลบบรรทัด 'filterOptions' ออกเพื่อให้ Autocomplete กรองเอง
            // filterOptions={(x) => x} 

            getOptionLabel={(opt) => (opt ? `${opt.fname} ${opt.lname}` : "")}
            value={selected!}

            inputValue={inputValue}

            onChange={(_, newValue) => {
                onChange(newValue ? newValue.id : null);
                // [FIX] ให้อัปเดต inputValue เมื่อเลือกเสมอ
                if (newValue) {
                    setInputValue(`${newValue.fname} ${newValue.lname}`);
                }
            }}
            onInputChange={(_, newInput) => {
                // [FIX] ให้อัปเดต state ทุกครั้งที่ input เปลี่ยน
                setInputValue(newInput);
            }}
            noOptionsText={communityId ? "ไม่พบสมาชิก" : "โปรดเลือกชุมชนก่อน"}
            renderInput={(params) =>
                renderCustomInput("community-member-selector", "เลือกผู้ดูแล", params)
            }
        />
    );
}

export default CommunityMemberSelector;