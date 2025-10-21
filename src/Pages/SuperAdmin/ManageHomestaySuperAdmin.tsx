/*
 * หน้า: จัดการที่พัก (Super Admin)
 * คำอธิบาย :
 *   - แสดงตารางรายการที่พักในชุมชน
 *   - breadcrumb: จัดการชุมชน > [ชื่อชุมชน] > จัดการที่พัก
 *   - ปุ่มย้อนกลับไปหน้ารายละเอียดชุมชน
 *   - ชิดขอบ content ให้สม่ำเสมอกับหน้า "จัดการชุมชน"
 * Role: SuperAdmin เท่านั้น
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

/* ===========================================================
   Components
   =========================================================== */
import DataTable from "@/Components/Tables/Index";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

/* ===========================================================
   Services
   =========================================================== */
import { getHomestaysAll } from "@/Libs/HomestayService";
import { getCommunityById } from "@/Services/community-service";

/* ===========================================================
   Types
   =========================================================== */
import type { Column, DataTableActionsConfig } from "@/Components/Tables/Types";

/* ===========================================================
   ประเภทข้อมูลที่ใช้ภายใน Component
   =========================================================== */
/*
 * คำอธิบาย : โครงสร้างข้อมูลที่พักในตารางที่ใช้แสดงผลในหน้า (หลัง mapping)
 */
type HomestayRow = {
  id: number;
  name: string;
  facility: string;
  type: string;
};

/*
 * คำอธิบาย : โครงสร้างข้อมูลที่พักที่รับจาก API (ก่อน mapping)
 */
type HomestayFromApi = {
  id: number;
  name: string;
  facility: string | null;
  type: string | null;
};

/* ===========================================================
   Utility Function
   =========================================================== */
/*
 * คำอธิบาย : แปลงข้อความให้เป็นตัวพิมพ์เล็ก ลบช่องว่างเกิน และ normalize สำหรับค้นหา
 * Input : s (string)
 * Output : string ที่ถูก normalize แล้ว
 */
const normalizeText = (s: string) =>
  (s ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();

/* ===========================================================
   Component หลัก : ManageHomestaySuperAdmin
   =========================================================== */
export default function ManageHomestaySuperAdmin() {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();

  const [communityName, setCommunityName] = useState<string>("");
  const [rows, setRows] = useState<HomestayRow[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isOpenConfirm, setIsOpenConfirm] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  /* ---------------------- โหลดชื่อชุมชน ---------------------- */
  useEffect(() => {
    async function fetchCommunity() {
      try {
        if (!communityId) return;
        const res = await getCommunityById(Number(communityId));
        setCommunityName(res.data?.data?.name || "-");
      } catch (error: unknown) {
        console.error(error);
      }
    }
    fetchCommunity();
  }, [communityId]);

  /* ---------------------- โหลดข้อมูลที่พัก ---------------------- */
  /*
   * คำอธิบาย : ฟังก์ชันโหลดข้อมูลที่พักทั้งหมดในชุมชนตาม communityId
   * Input : communityId (string)
   * Output : เซตข้อมูลที่พักลงใน state rows
   */
  const reload = useCallback(async () => {
    if (!communityId) return;
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await getHomestaysAll(Number(communityId));
      const payload = res.data?.data;
      const list: HomestayFromApi[] = Array.isArray(payload?.data)
        ? payload.data
        : [];
      const pg = payload?.pagination ?? {};

      const mapped: HomestayRow[] = list.map((h) => ({
        id: h.id,
        name: h.name ?? "-",
        facility: h.facility ?? "-",
        type: h.type ?? "-",
      }));

      setRows(mapped);
      setTotalItems(pg?.totalCount ?? mapped.length);
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error)
        setErrorMessage(error.message ?? "โหลดข้อมูลไม่สำเร็จ");
      else setErrorMessage("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    reload();
  }, [reload]);

  /* ---------------------- คอลัมน์ของตาราง ---------------------- */
  const columns: Column<HomestayRow>[] = [
    {
      key: "name",
      header: "ชื่อที่พัก",
      className: "min-w-[200px]",
      render: (row) => (
        <span className="text-dark-green font-medium">{row.name}</span>
      ),
    },
    { key: "facility", header: "สิ่งอำนวยความสะดวก" },
    { key: "type", header: "ประเภท" },
  ];

  /* ---------------------- Action ต่อแถว ---------------------- */
  /*
   * คำอธิบาย : ปุ่มแก้ไขและลบต่อแถวในตาราง
   * Input : ข้อมูล row ที่ผู้ใช้เลือก
   * Output : ทำงานตาม action ที่เลือก (แก้ไข / ลบ)
   */
  const rowActions: DataTableActionsConfig<HomestayRow> = {
    header: "จัดการ",
    align: "right",
    width: "120px",
    variant: "icons",
    className: "pr-6",
    items: () => ["edit", "delete"],
    callbacks: {
      edit: (row) =>
        navigate(`/super/community/${communityId}/homestay/edit/${row.id}`),
      delete: (row) => {
        setDeleteId(row.id);
        setIsOpenConfirm(true);
      },
    },
  };

  /* ---------------------- ลบที่พัก ---------------------- */
  /*
   * คำอธิบาย : ฟังก์ชันสำหรับลบข้อมูลที่พักตาม ID (ยังไม่เชื่อม API)
   * Input : homestayId (number)
   * Output : แสดง log ใน console
   */
  const handleDelete = async (homestayId: number) => {
    console.log("ลบที่พัก:", homestayId);
  };

  /* ---------------------- กรองข้อมูลตามคำค้นหา ---------------------- */
  /*
   * คำอธิบาย : ฟังก์ชันกรองข้อมูลในตารางตามคำค้นหา
   * Input : searchQuery (string)
   * Output : แสดงเฉพาะรายการที่มีคำค้นหาตรงกับ name, facility หรือ type
   */
  const filteredRows = useMemo(() => {
    const q = normalizeText(searchQuery);
    return rows.filter((row) =>
      [row.name, row.facility, row.type].some((v) =>
        normalizeText(v).includes(q)
      )
    );
  }, [rows, searchQuery]);

  /* ===========================================================
     ส่วนแสดงผล (Render)
     =========================================================== */
  /*
   * คำอธิบาย : ส่วน Render แสดงตารางข้อมูลที่พัก พร้อม Toolbar และ Modal ยืนยันการลบ
   */
  return (
    <div className="space-y-4 cursor-default">
      {/* Breadcrumb: ขยับซ้ายให้ตรงขอบตาราง */}
      <div className="-ml-6 pt-1 pb-1">
        <Breadcrumb
          items={[
            { label: "จัดการชุมชน", to: "/super/communities" },
            {
              label: communityName || "ชุมชน",
              to: `/super/community/${communityId}`,
            },
            { label: "จัดการที่พัก" },
          ]}
        />
      </div>

      {/* ส่วนหัวข้อ */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">จัดการที่พัก</h1>

        {/* Toolbar: Search + ปุ่มเพิ่มที่พัก */}
        <div className="flex items-center gap-3">
          <div className="max-w-md">
            <SearchBarTable
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="ml-auto">
            <Button
              onClick={() =>
                navigate(`/super/community/${communityId}/homestay/create`)
              }
              aria-label="เพิ่มที่พัก"
            >
              <span>+ เพิ่มที่พัก</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ตารางข้อมูลที่พัก */}
      <DataTable<HomestayRow>
        data={filteredRows}
        total={totalItems}
        columns={columns}
        getRowKey={(row) => row.id}
        page={currentPage}
        onPageChange={(p) => setCurrentPage(p)}
        actions={rowActions}
        selectable
        striped
        theme="brand"
        className="bg-white rounded-lg"
      />

      {/* Modal: ยืนยันการลบ */}
      <Modal
        open={isOpenConfirm}
        title="ยืนยันการลบที่พัก"
        text="คุณต้องการลบที่พักนี้หรือไม่?"
        onConfirm={async () => {
          if (deleteId == null) return;
          try {
            await handleDelete(deleteId);
            await reload();
          } catch (error: unknown) {
            console.error(error);
            if (error instanceof Error) alert(`ลบไม่สำเร็จ: ${error.message}`);
            else alert("ลบไม่สำเร็จ (unknown error)");
          } finally {
            setIsOpenConfirm(false);
            setDeleteId(null);
          }
        }}
        onCancel={() => {
          setIsOpenConfirm(false);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
