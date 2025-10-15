/*
* คำอธิบาย : รวม preset ของปุ่มกระทำ (actions) และ utility แปลง config -> RowAction[]
* สำหรับเรนเดอร์ปุ่มต่อแถวใน DataTable รวมถึงฟังก์ชันคืนคลาสของปุ่มตามรูปแบบและโทนสี
*/


import type { DataTableActionsConfig, PresetId, RowAction } from "./Types";
import { PencilIcon, TrashIcon, BanIcon, CheckIcon, XIcon, CopyIcon, UsersIcon } from "./Icon";

export function makePreset<T>(id: PresetId, cb?: (row: T) => void | Promise<void>): RowAction<T> {
    const map: Record<PresetId, RowAction<T>> = {
        edit:    { id: "edit",    label: "แก้ไข",            icon: PencilIcon, onClick: (r) => cb?.(r) },
        delete:  { id: "delete",  label: "ลบ",                icon: TrashIcon, onClick: (r) => cb?.(r), intent: "danger" },
        block:   { id: "block",   label: "บล็อก",             icon: BanIcon,   onClick: (r) => cb?.(r), intent: "warning" },
        unblock: { id: "unblock", label: "ยกเลิกการระงับ",    icon: BanIcon,   onClick: (r) => cb?.(r) },
        approve: { id: "approve", label: "อนุมัติ",           icon: CheckIcon, onClick: (r) => cb?.(r), intent: "primary" },
        reject:  { id: "reject",  label: "ปฏิเสธ",            icon: XIcon,     onClick: (r) => cb?.(r), intent: "warning" },
        copy:    { id: "copy",    label: "คัดลอก",            icon: CopyIcon,  onClick: (r) => cb?.(r) },
        users:   { id: "users",   label: "ผู้ใช้",            icon: UsersIcon, onClick: (r) => cb?.(r) },
    };
    return map[id];
}

export function resolveActions<T>(cfg: DataTableActionsConfig<T>, row: T): RowAction<T>[] {
    const { items, callbacks } = cfg;
    const list = typeof items === "function" ? items(row) : items;
    return list
        .map((it) => (typeof it === "string" ? makePreset<T>(it, callbacks?.[it]) : (it as RowAction<T>)))
        .filter((a) => (a.visible ? a.visible(row) : true));
}

export function getActionButtonClass(variant: "icons" | "buttons", intent?: RowAction<any>["intent"]) {
    const base = "rounded-md inline-flex items-center justify-center gap-1 text-sm leading-none";
    if (variant === "icons") return base + " p-1.5 hover:bg-black/5";
    const tone =
        intent === "danger" ? "bg-rose-600 text-white hover:opacity-90" :
            intent === "primary" ? "bg-emerald-700 text-white hover:opacity-90" :
                intent === "warning" ? "bg-amber-600 text-white hover:opacity-90" :
                      intent === "neutral"   ? "bg-[#989898] text-white hover:opacity-90" : 
                           "bg-white border border-slate-300 text-slate-800 hover:bg-slate-50";
    return `${base} px-3 py-1 ${tone}`;
}