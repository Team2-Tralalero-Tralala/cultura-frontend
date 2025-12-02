/*
* คำอธิบาย : คอมโพเนนต์ DataTable (Generic) สำหรับแสดงข้อมูลตารางแบบรีใช้ซ้ำ
* รองรับ pagination (controlled/uncontrolled), server/client mode,
* เลือกแถว + bulk actions + row actions (icons/buttons), ธีมสี, และลายแถวสลับสี
*/

import { useState, useEffect, useRef } from "react";
import type { DataTableProps } from "./Types";
import { resolveActions, getActionButtonClass } from "./TablePresets";
import { themeHead, borderTone, softBg, containerBorderCls, containerRingCls } from "./Theme";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icon";

/*
   PageSizeDropdown (Custom)
   อธิบาย : ดรอปดาวน์กำหนด “จำนวนแถวต่อหน้า” แบบคัสตอม เพื่อควบคุมสไตล์ hover/active
   พฤติกรรม :
   - คลิกปุ่มเพื่อเปิด/ปิดเมนู
   - คลิคนอกกล่องเพื่อปิดเมนู (useEffect + document mousedown)
   การเข้าถึง (a11y) :
   - ใช้ aria-haspopup="listbox", aria-expanded บนปุ่ม
   - ใช้ role="listbox"/role="option" ในเมนู/ตัวเลือก
*/
function PageSizeDropdown({
  value,
  options,
  onChange,
}: {
  value: number;
  options: number[];
  onChange: (v: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // ปิดเมนูเมื่อคลิกนอกกล่อง
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={ref} className="relative inline-block text-left cursor-pointer">
      {/* ปุ่มหลัก (หน้าตาเหมือน select เดิม) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-9 min-w-[72px] rounded-lg border border-slate-300 bg-white px-2 text-sm inline-flex items-center justify-between gap-2 cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{value}</span>
        <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
          <path d="M6 8l4 4 4-4" fill="currentColor" />
        </svg>
      </button>

      {/* เมนูตัวเลือก */}
      {open && (
        <div
          role="listbox"
          className="absolute z-20 mt-1 w-full rounded-lg border border-slate-300 bg-white shadow-md overflow-hidden cursor-pointer"
        >
          {options.map((opt) => {
            const active = opt === value;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm ${
                  active ? "bg-[#9EFFA2]/70" : "hover:bg-[#9EFFA2]"
                } cursor-pointer`}
                role="option"
                aria-selected={active}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/*
   DataTable
   อธิบาย : คอมโพเนนต์ตารางกลาง ใช้ generic <T> ให้รับข้อมูลทุกรูปแบบ
   โหมดการแบ่งหน้า :
   - Controlled : ส่ง page + onPageChange จากภายนอก
   - Uncontrolled : ใช้ state ภายใน (pageUnctrl)
   การเลือกแถว :
   - รองรับ controlled/uncontrolled (selectedKeys/onSelectedChange หรือภายใน)
   เรนเดอร์ :
   - หน้า/หัวตาราง/เนื้อหา/แถวว่าง/ไม่มีข้อมูล/ส่วนท้าย (สรุป + paginate + page size)
*/
export function DataTable<T extends Record<string, unknown>>({
  data,
  getKey,
  columns,
  pageSizeOptions = [10, 20, 50],
  selectable = false,
  onPageChange,
  onPageSizeChange,
  onSelectedChange,
  bulkActions,
  actions,
  theme = "brand", // ค่าเริ่มต้น: ใช้ธีมสี brand
  pagination,
  isLoading
}: DataTableProps<T>) {

  const rowCellBase = "h-12 align-middle"; // h-12 ≈ 48px

  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    onSelectedChange?.(data.filter((row) => selected.includes(getKey(row))));
  }, [selected]);


  const toggleAll = () => {
    setSelected(selected.length === data.length ? [] : data.map((row) => getKey(row)));
  };

  const toggle = (rowKey: string) => {
    setSelected(selected.includes(rowKey) ? selected.filter((k) => k !== rowKey) : [...selected, rowKey]);
  };



  return (
    <div
      className={`rounded-2xl border ${containerBorderCls[theme]} shadow-sm ring-1 ${containerRingCls[theme]} bg-white`}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full rounded-xl overflow-hidden">
          {/* ── ส่วนหัวตาราง (thead) ─────────────────────────────────────────── */}
          <thead>
            <tr className={`${themeHead[theme]} text-lg font-medium text-white`}>
              {selectable && (
                <th className="w-12 px-3 py-3">
                  {/* กล่องเลือกทั้งหมด (indeterminate = เลือกบางส่วน) */}
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={selected.length === data.length}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-slate-300 accent-[#989898]"
                    />
                  </label>
                </th>
              )}
              {/* หัวคอลัมน์ตาม columns */}
              {columns.map((c) => (
                <th
                  key={String(c.key)}
                  className={`px-4 py-3 text-left text-lg font-light ${c.className ?? ""}`}
                  style={c.width ? { width: c.width } : undefined}
                >
                  {c.header}
                </th>
              ))}
              {/* คอลัมน์ "จัดการ" (actions) */}
              {actions && actions?.visible !== false && (
                <th
                  className={`px-4 py-3 text-lg font-light ${
                    actions.align === "left" ? "text-left" : "text-right"
                  } ${actions.className ?? ""}`}
                  style={actions.width ? { width: actions.width } : undefined}
                >
                  {actions.header ?? "จัดการ"}
                </th>
              )}
            </tr>
          </thead>

          {/* ── เนื้อหาตาราง (tbody) ────────────────────────────────────────── */}
          <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0) + (actions?.visible === false || !actions ? 0 : 1)} className="px-4 text-center text-sm font-light text-slate-500 h-12 align-middle">
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand"></div>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                            {data.map((rowData, index) => {
              const rowIndex = index;
              const rowKey = getKey(rowData);
              const rowActions = actions &&  actions?.visible === false || !actions ? [] : resolveActions(actions, rowData);

              return (
                <tr
                  key={rowKey}
                  className={`${rowIndex % 2 === 1 ? softBg[theme] : "bg-white"} ${borderTone[theme]} border-b`}
                >
                  {/* เช็กบ็อกซ์ต่อแถว */}
                  {selectable && (
                    <td className={`w-12 px-3 text-center text-base text-black font-normal ${rowCellBase}`}>
                      <input
                        type="checkbox"
                        checked={selected.includes(rowKey)}
                        onChange={() => toggle(rowKey)}
                        className="h-4 w-4 rounded border-slate-300 accent-[#989898]"
                      />
                    </td>
                  )}

                  {/* เซลล์ของแต่ละคอลัมน์ */}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`px-4 text-base text-black font-normal ${column.className ?? ""} ${rowCellBase}`}
                      style={column.width ? { width: column.width } : undefined}
                    >
                      {column.render ? column.render(rowData) : String((rowData as any)[column.key] ?? "")}
                    </td>
                  ))}

                  {/* ปุ่มจัดการต่อแถว */}
                  {actions?.visible !== false && actions && (
                    <td className={`px-4 text-base text-black font-normal ${actions.align === "left" ? "text-left" : "text-right"} ${rowCellBase}`}>
                      <div
                        className={`inline-flex items-center gap-2 ${
                          actions.align === "left" ? "justify-start" : "justify-end"
                        }`}
                      >
                        {rowActions.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => a.onClick(rowData)}
                            className={`${getActionButtonClass(actions.variant ?? "icons", a.intent)} ${
                              a.className ?? ""
                            }`}
                            title={a.label}
                            aria-label={a.label}
                          >
                            {actions.variant === "buttons" ? (
                              <>
                                {a.icon && <a.icon className="h-4 w-4" />}
                                <span>{a.label}</span>
                              </>
                            ) : a.icon ? (
                              <a.icon className="h-4 w-4" />
                            ) : (
                              <span className="text-xs">{a.label}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}

            {/* เติมแถวว่างให้ครบ pageSize (เมื่อมีข้อมูลรวม > 0) */}
            {Array.from({ length: Math.max(0, pagination.limit - data.length) }).map((_, i) => {
              const rowIndex = data.length + i;
              return (
                <tr
                  key={`empty-${rowIndex}`}
                  className={`${rowIndex % 2 === 1 ? softBg[theme] : "bg-white"} ${borderTone[theme]} border-b`}
                >
                  {selectable && <td className={`w-12 px-3 ${rowCellBase}`} />}
                  {columns.map((column, columnIndex) => (
                    <td
                      key={`empty-cell-${columnIndex}`}
                      className={`px-4 text-base font-light text-slate-800 ${column.className ?? ""} ${rowCellBase}`}
                      style={column.width ? { width: column.width } : undefined}
                    />
                  ))}
                  {actions?.visible !== false && actions && <td className={`px-4 ${rowCellBase}`} />}
                </tr>
              );
            })}

            {/* ไม่มีข้อมูลจริง ๆ */}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={
                    columns.length + (selectable ? 1 : 0) + (actions?.visible === false || !actions ? 0 : 1)
                  }
                  className={`px-4 text-center text-sm font-light text-slate-500 ${rowCellBase}`}
                >
                  ไม่มีข้อมูล
                </td>
              </tr>
            )}
                </>
              )}
          </tbody>
        </table>
      </div>

      {/* ── Footer : สรุปการเลือก + Bulk actions + Page size + Pagination ─── */}
      <div className={`border-t ${borderTone[theme]} ${softBg[theme]} px-4 py-3`}>
        {/* แถวบน: สรุปการเลือก + ปุ่ม bulk (ขวา) */}
        <div className="flex items-center justify-between gap-3 mb-2">
          {selected.length > 0 ? (
            <>
              <span className="text-sm font-light text-slate-700">
                เลือก <b>{selected.length}</b> แถว จากทั้งหมด <b>{pagination.limit}</b> แถว
              </span>
              <div className="flex items-center gap-2">
                {bulkActions?.map((ba) => (
                  <button
                    key={ba.id}
                    onClick={() =>
                      ba.onClick(data.filter((row) => selected.includes(getKey(row)))) // ส่งเฉพาะแถวที่เลือกในหน้านี้
                    }
                    className={`${getActionButtonClass("buttons", ba.intent)} ${ba.className ?? ""}`}
                  >
                    {ba.icon && <ba.icon className="h-4 w-4" />} {ba.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <span className="text-sm font-light text-slate-700">
                ทั้งหมด <b>{data.length.toLocaleString()}</b> แถว
              </span>
              <span />
            </>
          )}
        </div>

        {/* แถวล่าง: Page size (ซ้าย) + paginate (ขวา) */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <label className="text-slate-700">จำนวนแถวต่อหน้า :</label>
            <PageSizeDropdown
              value={pagination.limit}
              options={pageSizeOptions}
              onChange={(v) => {
                onPageSizeChange?.(v);
              }}
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-700">
            <span>
              {Math.max((pagination.currentPage-1) * pagination.limit +1, 1)}-{Math.min((pagination.currentPage) * pagination.limit, pagination.totalCount)} จาก {pagination.totalCount.toLocaleString()}
            </span>
            <div className="flex items-center">
              <button
                onClick={() => onPageChange?.(Math.max(1, pagination.currentPage - 1))}
                disabled={pagination.currentPage === 1}
                className="ml-2 rounded-md p-1 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                aria-label="ก่อนหน้า"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => onPageChange?.(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="ml-2 rounded-md p-1 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                aria-label="ถัดไป"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
