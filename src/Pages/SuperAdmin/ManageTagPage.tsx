/**
 * คำอธิบาย : Component สำหรับจัดการประเภท (Super Admin)
 * - แสดงรายการแท็กทั้งหมดในชุมชน
 * - สามารถค้นหา เพิ่ม แก้ไข ลบ แท็กได้
 * - ใช้งานร่วมกับ Modal ยืนยันและฟอร์มเพิ่ม/แก้ไข
 */
import React, { useState, useEffect, useCallback } from "react";
import DataTable from "@/Components/Tables/DataTable";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import Button from "@/Components/Button";
import ModalTag from "@/Components/Modal/ModalTag";
import { Modal as ModalConfirm } from "@/Components/Modal/Modal";
import { TrashIcon } from "@/Components/Tables/Icon";
import * as TagService from "@/Libs/TagService";

import type {
  Column,
  DataTableActionsConfig,
  BulkAction,
  Pagination,
} from "@/Components/Tables/Types";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

export type TagRow = { id: number; name: string };

/*
 * คำอธิบาย : ฟังก์ชันหลักของหน้าจัดการประเภท
ิ * Input : ไม่มี
 * Output : JSX.Element สำหรับการจัดการแท็ก
 */
export function ManageTagPage() {
  const [rows, setRows] = useState<TagRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<TagRow[]>([]);

  // modal state
  const [selectedTag, setSelectedTag] = useState<TagRow | null>(null);
  const [modalType, setModalType] = useState<"create" | "edit" | "delete" | null>(null);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingTagName, setPendingTagName] = useState("");

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลแท็กทั้งหมดจาก API
   * Input :
   *   - page : หน้าที่ต้องการแสดง
   *   - limit : จำนวนรายการต่อหน้า
   *   - search : คำค้นหา (Optional)
   * Output : อัปเดต state rows และ pagination
   */
  const fetchData = async (page: number, limit: number, search: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await TagService.fetchTags(page, limit, search);

      const resultData = res?.data?.data ?? [];
      const resultPagination = res?.data?.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10,
      };

      const mappedRows: TagRow[] = Array.isArray(resultData)
        ? resultData.map((tag: any) => ({ id: tag.id, name: tag.name }))
        : [];

      setRows(mappedRows);
      setPagination(resultPagination);
    } catch (error: any) {
      setErrorMessage(error?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * คำอธิบาย : ฟังก์ชัน useEffect สำหรับโหลดข้อมูลเมื่อเปลี่ยนหน้า จำนวนเรคอร์ดต่อหน้า หรือคำค้นหา
   * Input : pagination.currentPage, pagination.limit, searchQuery
   * Output : เรียก fetchData เพื่อโหลดข้อมูลใหม่
   */
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchData(pagination.currentPage, pagination.limit, searchQuery);
    }, 500);

    return () => clearTimeout(delay);
  }, [pagination.currentPage, pagination.limit, searchQuery]);

  /*
   * คำอธิบาย : ฟังก์ชันเปิด modal สำหรับ create/edit
   * Input :
   *   - type : ประเภท modal "create" และ "edit"
   *   - tag : ข้อมูล tag ที่เลือก (ถ้ามี)
   * Output : อัปเดต state modal
   */
  const openInputModal = (type: "create" | "edit", tag: TagRow | null = null) => {
    setModalType(type);
    setSelectedTag(tag);
    setIsInputModalOpen(true);
    setPendingTagName(tag?.name ?? "");
  };

  /*
   * คำอธิบาย : ฟังก์ชันปิด modal และ reset state
   * Input : ไม่มี
   * Output : อัปเดต state modal
   */
  const closeInputModal = () => {
    setModalType(null);
    setSelectedTag(null);
    setIsInputModalOpen(false);
    setPendingTagName("");
  };

  /*
   * คำอธิบาย : ฟังก์ชันเรียก modal ยืนยันการลบ tag
   * Input : tag : ข้อมูล tag ที่ต้องการลบ
   * Output : เปิด modal ยืนยัน
   */
  const handleDelete = (tag: TagRow) => {
    setSelectedTag(tag);
    setModalType("delete");
    setIsConfirmModalOpen(true);
  };

  /*
   * คำอธิบาย : ฟังก์ชันยืนยัน action ของ modal (create/edit/delete)
   * Input : ไม่มี
   * Output : ดำเนินการตาม action ที่เลือกและรีเฟรชข้อมูล
   */
  const handleFinalConfirm = async () => {
    try {
      if (modalType === "create") await TagService.createTag(pendingTagName);
      else if (modalType === "edit" && selectedTag)
        await TagService.updateTag(selectedTag.id, pendingTagName);
      else if (modalType === "delete" && selectedTag) await TagService.deleteTag(selectedTag.id);

      closeInputModal();
      setIsConfirmModalOpen(false);
      await fetchData(pagination.currentPage, pagination.limit, searchQuery);
    } catch (error) {
      console.error(error);
    }
  };

  /*
   * คำอธิบาย : ฟังก์ชันกำหนด columns ของ DataTable
   * Input : ไม่มี
   * Output : รายการคอลัมน์สำหรับ DataTable
   */
  const columns: Column<TagRow>[] = [
    {
      key: "name",
      header: "ชื่อประเภท",
      render: (tag) => (
        <span
          className="text-dark-green cursor-pointer hover:underline hover:underline-offset-1"
          onClick={() => openInputModal("edit", tag)}
        >
          {tag.name}
        </span>
      ),
    },
  ];

  /*
   * คำอธิบาย : ฟังก์ชันกำหนดการกระทำของแต่ละแถวในตาราง
   * Input : ไม่มี
   * Output : การกำหนดค่าการกระทำของแต่ละแถว
   */
  const rowActions: DataTableActionsConfig<TagRow> = {
    header: "จัดการ",
    align: "left",
    width: "120px",
    variant: "icons",
    items: () => ["edit", "delete"],
    callbacks: {
      edit: (row) => openInputModal("edit", row),
      delete: (row) => handleDelete(row),
    },
  };

  /*
   * คำอธิบาย : ฟังก์ชันกำหนด bulk actions สำหรับ rows ที่เลือก
   * Input : ไม่มี
   * Output : รายการการกระทำแบบกลุ่ม
   */
  const bulkActions: BulkAction<TagRow>[] = [
    {
      id: "bulk-delete",
      label: "ลบทั้งหมด",
      icon: TrashIcon,
      intent: "neutral",
      confirm: (rows) => `ยืนยันลบ ${rows.length} รายการหรือไม่?`,
      onClick: async (rows) => {
        await Promise.all(rows.map((row) => TagService.deleteTag(row.id)));
        await fetchData(pagination.currentPage, pagination.limit, searchQuery);
      },
    },
  ];

  return (
    <div className="space-y-4 cursor-default">
      <div className="flex flex-col gap-2 w-full">
        <div>
          <Breadcrumb
            current={{
              label: "จัดการประเภท",
              to: "/super/tags",
              fromSidebar: true,
            }}
          />
        </div>

        <h1 className="text-xl font-bold ">จัดการประเภท</h1>

        <div className="flex items-center justify-between w-full ">
          <div className="w-[260px]">
            <SearchBarTable
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
            />
          </div>
          <div>
            <Button onClick={() => openInputModal("create")}>
              <span className="text-lg leading-none">＋</span>
              <span>เพิ่มประเภท</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="pb-10">
        {errorMessage && <div className="text-sm text-red-600 mb-2">{errorMessage}</div>}

        <DataTable<TagRow>
          data={rows}
          getKey={(row) => String(row.id)}
          columns={columns}
          selectable
          onSelectedChange={setSelectedRows}
          pagination={pagination}
          isLoading={isLoading}
          actions={rowActions}
          bulkActions={bulkActions}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, currentPage: page }))}
          onPageSizeChange={(pageSize) =>
            setPagination((prev) => ({ ...prev, currentPage: 1, limit: pageSize }))
          }
          pageSizeOptions={[10, 30, 50]}
          theme="brand"
        />
      </div>

      <ModalConfirm
        open={isConfirmModalOpen}
        onConfirm={handleFinalConfirm}
        onCancel={() => {
          setIsConfirmModalOpen(false);
          closeInputModal();
        }}
        title={
          modalType === "delete"
            ? "ยืนยันการลบประเภท"
            : modalType === "edit"
              ? "ยืนยันการแก้ไขประเภท"
              : "ยืนยันการเพิ่มประเภท"
        }
        text={
          modalType === "delete"
            ? "คุณต้องการลบประเภทนี้หรือไม่?"
            : modalType === "edit"
              ? "คุณต้องการแก้ไขประเภทนี้หรือไม่?"
              : "คุณต้องการเพิ่มประเภทนี้หรือไม่?"
        }
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
      />

      <ModalTag
        isOpen={isInputModalOpen}
        onClose={closeInputModal}
        onConfirm={(name) => {
          setPendingTagName(name);
          setIsConfirmModalOpen(true);
        }}
        initialValue={modalType === "edit" ? selectedTag?.name : ""}
        existingTags={rows.map((tag) => tag.name)}
        errorMessage=""
      />
    </div>
  );
}
