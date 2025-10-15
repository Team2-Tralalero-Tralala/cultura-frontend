/*
* คำอธิบาย : คอมโพเนนต์ DataTable (Generic) สำหรับแสดงข้อมูลตารางแบบรีใช้ซ้ำ
* รองรับ pagination (controlled/uncontrolled), server/client mode,
* เลือกแถว + bulk actions + row actions (icons/buttons), ธีมสี, และลายแถวสลับสี
*/

import React, { useMemo, useState, useEffect, useRef } from "react";
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
    <div ref={ref} className="relative inline-block text-left">
      {/* ปุ่มหลัก (หน้าตาเหมือน select เดิม) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-9 min-w-[72px] rounded-lg border border-slate-300 bg-white px-2 text-sm inline-flex items-center justify-between gap-2"
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
          className="absolute z-20 mt-1 w-full rounded-lg border border-slate-300 bg-white shadow-md overflow-hidden"
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
                }`}
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
  total,
  columns,
  getRowKey,
  page,
  onPageChange,
  pageSizeOptions = [10, 20, 50],
  defaultPageSize = 10,
  selectable = true,
  selectedKeys,
  onSelectedChange,
  bulkActions,
  actions,
  striped = true,
  className,
  theme = "brand", // ค่าเริ่มต้น: ใช้ธีมสี brand
}: DataTableProps<T>) {
  /* State: หน้าปัจจุบัน (กรณี uncontrolled) */
  const [pageUnctrl, setPageUnctrl] = useState(1);

  /* ค่าคงที่ UI : ความสูงเซลล์/การจัดแนวแนวตั้ง */
  const rowCellBase = "h-12 align-middle"; // h-12 ≈ 48px

  /* ตรวจโหมด pagination ที่คุมจากภายนอก (controlled) */
  const isCtrlPage = typeof page === "number" && !!onPageChange;
  const pageNow = isCtrlPage ? page! : pageUnctrl;

  /** setPageNow
   * อธิบาย : อัปเดตหมายเลขหน้า รองรับทั้งโหมด controlled/uncontrolled
   * พารามิเตอร์ : v หมายเลขหน้าใหม่
   */
  const setPageNow = (v: number) => (isCtrlPage ? onPageChange!(v) : setPageUnctrl(v));

  /* State: จำนวนแถวต่อหน้า */
  const [pageSize, setPageSize] = useState(defaultPageSize);

  /* การเลือกแถว: รองรับทั้ง controlled/uncontrolled */
  const [selInternal, setSelInternal] = useState<Set<React.Key>>(new Set());
  const sel = selectedKeys ? new Set(selectedKeys) : selInternal;

  /** setSel
   * อธิบาย : อัปเดตชุด keys ที่ถูกเลือก และแจ้งผลออกไปถ้าเป็นโหมด controlled
   */
  const setSel = (keys: React.Key[]) => {
    if (selectedKeys) onSelectedChange?.(keys, data.filter((_, i) => keys.includes(getKey(_, i))));
    else setSelInternal(new Set(keys));
  };

  /** getKey
   * อธิบาย : คืน key ของแต่ละแถว (หากไม่ส่ง getRowKey เข้ามา ใช้ index)
   */
  const getKey = (row: T, i: number) => (getRowKey ? getRowKey(row, i) : i);

  /* นับรวมรายการทั้งหมด (server/client mode) */
  const totalCount = typeof total === "number" ? total : data.length;
  const start = totalCount === 0 ? 0 : (pageNow - 1) * pageSize + 1;
  const end = Math.min(totalCount, pageNow * pageSize);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  /** pageData (useMemo)
   * อธิบาย : คำนวณข้อมูลหน้าปัจจุบัน
   * - server-mode (มี total) : ใช้ data ตรง ๆ (ไม่ slice)
   * - client-mode : slice จาก data ตาม pageNow/pageSize
   */
  const pageData = useMemo(() => {
    if (typeof total === "number") return data; // server-mode
    const s = (pageNow - 1) * pageSize;
    return data.slice(s, s + pageSize);
  }, [data, pageNow, pageSize, total]);

  /* คีย์ทั้งหมดในหน้านี้ (ช่วยเช็กเลือกทั้งหมด/บางส่วน) */
  const allKeysOnPage = pageData.map((r, i) => getKey(r, (pageNow - 1) * pageSize + i));
  const allChecked = selectable && allKeysOnPage.length > 0 && allKeysOnPage.every((k) => sel.has(k));
  const someChecked = selectable && !allChecked && allKeysOnPage.some((k) => sel.has(k));
  const selectedOnPageCount = allKeysOnPage.filter((k) => sel.has(k)).length;

  /** toggleAll
   * อธิบาย : เลือก/ยกเลิกเลือกทุกแถวภายใน "หน้านี้"
   */
  const toggleAll = () => {
    if (!selectable) return;
    const next = new Set(sel);
    if (allChecked) allKeysOnPage.forEach((k) => next.delete(k));
    else allKeysOnPage.forEach((k) => next.add(k));
    setSel(Array.from(next));
  };

  /** toggleOne
   * อธิบาย : เลือก/ยกเลิกเลือกแถวเดียวตาม key ที่ระบุ
   */
  const toggleOne = (k: React.Key) => {
    if (!selectable) return;
    const next = new Set(sel);
    next.has(k) ? next.delete(k) : next.add(k);
    setSel(Array.from(next));
  };

  return (
    <div
      className={`rounded-2xl border ${containerBorderCls[theme]} shadow-sm ring-1 ${containerRingCls[theme]} bg-white ${
        className ?? ""
      }`}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full rounded-xl overflow-hidden">
          {/* ── ส่วนหัวตาราง (thead) ─────────────────────────────────────────── */}
          <thead>
            <tr className={themeHead[theme]}>
              {selectable && (
                <th className="w-12 px-3 py-3">
                  {/* กล่องเลือกทั้งหมด (indeterminate = เลือกบางส่วน) */}
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={(el) => {
                        if (el) el.indeterminate = someChecked;
                      }}
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
              {actions?.visible !== false && actions && (
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
            {pageData.map((row, i) => {
              const gi = (pageNow - 1) * pageSize + i; // ดัชนีรวม (คุมลายสลับสี)
              const k = getKey(row, gi);
              const rowActions = actions?.visible === false || !actions ? [] : resolveActions(actions, row);

              return (
                <tr
                  key={String(k)}
                  className={`${striped && gi % 2 === 1 ? softBg[theme] : "bg-white"} ${borderTone[theme]} border-b`}
                >
                  {/* เช็กบ็อกซ์ต่อแถว */}
                  {selectable && (
                    <td className={`w-12 px-3 text-center ${rowCellBase}`}>
                      <input
                        type="checkbox"
                        checked={sel.has(k)}
                        onChange={() => toggleOne(k)}
                        className="h-4 w-4 rounded border-slate-300 accent-[#989898]"
                      />
                    </td>
                  )}

                  {/* เซลล์ของแต่ละคอลัมน์ */}
                  {columns.map((c) => (
                    <td
                      key={String(c.key)}
                      className={`px-4 text-base font-light text-slate-800 ${c.className ?? ""} ${rowCellBase}`}
                      style={c.width ? { width: c.width } : undefined}
                    >
                      {c.render ? c.render(row) : String((row as any)[c.key] ?? "")}
                    </td>
                  ))}

                  {/* ปุ่มจัดการต่อแถว */}
                  {actions?.visible !== false && actions && (
                    <td className={`px-4 ${actions.align === "left" ? "text-left" : "text-right"} ${rowCellBase}`}>
                      <div
                        className={`inline-flex items-center gap-2 ${
                          actions.align === "left" ? "justify-start" : "justify-end"
                        }`}
                      >
                        {rowActions.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => a.onClick(row)}
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
            {Array.from({ length: Math.max(0, totalCount > 0 ? pageSize - pageData.length : 0) }).map((_, i) => {
              const giEmpty = (pageNow - 1) * pageSize + pageData.length + i; // คุมลายสลับสีให้ต่อเนื่อง
              return (
                <tr
                  key={`empty-${i}`}
                  className={`${striped && giEmpty % 2 === 1 ? softBg[theme] : "bg-white"} ${borderTone[theme]} border-b`}
                >
                  {selectable && <td className={`w-12 px-3 ${rowCellBase}`} />}
                  {columns.map((c, ci) => (
                    <td
                      key={`empty-cell-${ci}`}
                      className={`px-4 text-base font-light text-slate-800 ${c.className ?? ""} ${rowCellBase}`}
                      style={c.width ? { width: c.width } : undefined}
                    />
                  ))}
                  {actions?.visible !== false && actions && <td className={`px-4 ${rowCellBase}`} />}
                </tr>
              );
            })}

            {/* ไม่มีข้อมูลจริง ๆ */}
            {pageData.length === 0 && totalCount === 0 && (
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
          </tbody>
        </table>
      </div>

      {/* ── Footer : สรุปการเลือก + Bulk actions + Page size + Pagination ─── */}
      <div className={`border-t ${borderTone[theme]} ${softBg[theme]} px-4 py-3`}>
        {/* แถวบน: สรุปการเลือก + ปุ่ม bulk (ขวา) */}
        <div className="flex items-center justify-between gap-3 mb-2">
          {selectedOnPageCount > 0 ? (
            <>
              <span className="text-sm font-light text-slate-700">
                เลือก <b>{selectedOnPageCount}</b> แถว จากทั้งหมด <b>{pageSize}</b> แถว
              </span>
              <div className="flex items-center gap-2">
                {bulkActions?.map((ba) => (
                  <button
                    key={ba.id}
                    onClick={() =>
                      ba.onClick(pageData.filter((_, i) => sel.has(allKeysOnPage[i]))) // ส่งเฉพาะแถวที่เลือกในหน้านี้
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
                ทั้งหมด <b>{totalCount.toLocaleString()}</b> แถว
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
              value={pageSize}
              options={pageSizeOptions}
              onChange={(v) => {
                setPageSize(v);
                setPageNow(1);
              }}
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-700">
            <span>
              {start}-{end} จาก {totalCount.toLocaleString()}
            </span>
            <div className="flex items-center">
              <button
                onClick={() => setPageNow(Math.max(1, pageNow - 1))}
                disabled={pageNow === 1}
                className="ml-2 rounded-md p-1 disabled:opacity-40 disabled:pointer-events-none"
                aria-label="ก่อนหน้า"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setPageNow(Math.min(totalPages, pageNow + 1))}
                disabled={pageNow === totalPages}
                className="ml-2 rounded-md p-1 disabled:opacity-40 disabled:pointer-events-none"
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