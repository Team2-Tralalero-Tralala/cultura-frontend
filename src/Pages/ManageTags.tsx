/*
 * คำอธิบาย : Page Component สำหรับหน้า "จัดการประเภทกิจกรรม"
 * หน้าที่ :
 *   - ดึงข้อมูลแท็กทั้งหมดจาก API
 *   - สร้าง, แก้ไข และลบแท็ก
 *   - ค้นหาแท็กตามชื่อ
 *   - แสดงข้อมูลในตาราง พร้อมปุ่มจัดการ
 *   - เปิด SweetAlert2 Modal เพื่อยืนยันก่อนสร้าง/แก้ไข/ลบ
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Button from "../Components/Button";
import SearchBarTable from "../Components/Search/SerachBarTable";
import DataTable from "../Components/Tables/Index";
import type { Column, DataTableActionsConfig } from "../Components/Tables/Types";
import {
  getAllTags,
  createTag,
  updateTag,
  deleteTag as deleteTagAPI,
} from "../Libs/TagService";

// Modal Input (แบบกรอกชื่อ tag)
import TagModal from "../Components/ModalTags";

// Modal Confirm (SweetAlert2)
import { Modal as ModalConfirm } from "../Components/Modal/Modal";

// ประเภทข้อมูล Tag
export type Tag = {
  id: number;
  name: string;
};

// ตั้งค่าคอลัมน์ของตาราง
const columns: Column<Tag>[] = [
  { key: "name", header: "ชื่อแท็ก", className: "min-w-[200px]" },
];

export default function TagsPage() {

  // State หลักของ component
  const [tags, setTags] = useState<Tag[]>([]); // รายการแท็กทั้งหมด
  const [searchQuery, setSearchQuery] = useState<string>(""); // ค่าค้นหา
  const [isLoading, setIsLoading] = useState<boolean>(true); // สถานะกำลังโหลด
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // ข้อความ error ตอนโหลดข้อมูล
  const [submitError, setSubmitError] = useState<string | null>(null); // error ตอน submit ฟอร์ม (เช่น ชื่อซ้ำ)

  // สำหรับ modal input
  const [showInputModal, setShowInputModal] = useState(false); // ควบคุมการแสดง modal input
  const [modalType, setModalType] = useState<"create" | "edit" | "delete" | null>(null); // ประเภท modal ที่แสดง
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null); // แท็กที่ถูกเลือก (ใช้กับ edit/delete)

  // สำหรับ SweetAlert2 Confirm
  const [showConfirmModal, setShowConfirmModal] = useState(false); // ควบคุมการแสดง modal ยืนยัน
  const [pendingTagName, setPendingTagName] = useState<string>(""); // เก็บชื่อแท็กที่กำลังจะสร้าง/แก้ไข

  // ดึงข้อมูลแท็กทั้งหมดจาก API
  const fetchTags = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await getAllTags();
      const tagsData = response.data.data as Tag[];
      if (!Array.isArray(tagsData)) throw new Error("API data is not an array");
      setTags(tagsData);
    } catch (error: any) {
      setErrorMessage(error?.message ?? "ไม่สามารถโหลดข้อมูลแท็กได้");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // เรียก fetchTags เมื่อโหลดหน้า
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // เปิด modal สร้าง/แก้ไข
  const openInputModal = (type: "create" | "edit", tag: Tag | null = null) => {
    setModalType(type);
    setSelectedTag(tag);
    setShowInputModal(true);
  };

  // ปิด modal input
  const closeInputModal = () => {
    setShowInputModal(false);
    setSelectedTag(null);
    setModalType(null);
    setSubmitError(null);
  };

  // เมื่อกดยืนยันใน modal input (create/edit)
  const handleInputModalConfirm = (name: string) => {
    setPendingTagName(name); // เก็บชื่อไว้ก่อน
    setShowConfirmModal(true); // เปิด modal ยืนยัน
  };


  // เมื่อกดลบแท็ก
  const handleDelete = (tag: Tag) => {
    setSelectedTag(tag); // เก็บแท็กที่ต้องการลบ
    setModalType("delete");
    setShowConfirmModal(true); // เปิด modal ยืนยันลบ
  };


  // เมื่อกดยืนยันใน SweetAlert2 (create/edit/delete)
  const handleFinalConfirm = async () => {
    try {
      if (modalType === "create") {
        await createTag(pendingTagName);
      } else if (modalType === "edit" && selectedTag) {
        await updateTag(selectedTag.id, pendingTagName);
      } else if (modalType === "delete" && selectedTag) {
        await deleteTagAPI(selectedTag.id);
      }

      await fetchTags(); // โหลดข้อมูลใหม่
    } catch (error: any) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setShowConfirmModal(false);
      closeInputModal();
      setPendingTagName("");
      setSelectedTag(null);
      setModalType(null);
    }
  };


  // กำหนด action ในแต่ละแถวของตาราง
  const rowActions = useMemo<DataTableActionsConfig<Tag>>(
    () => ({
      header: "จัดการ",
      align: "left",
      width: "120px",
      variant: "icons",
      items: () => ["edit", "delete"],
      callbacks: {
        edit: (row) => openInputModal("edit", row),
        delete: (row) => handleDelete(row),
      },
    }),
    []
  );


  // Normalize ข้อความเพื่อใช้ค้นหา
  const normalizeText = (s: string) =>
    (s ?? "").toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();

  // กรองแท็กตามข้อความค้นหา
  const filteredTags = useMemo(() => {
    const q = normalizeText(searchQuery);
    return q ? tags.filter((tag) => normalizeText(tag.name).includes(q)) : tags;
  }, [tags, searchQuery]);

  // Render ส่วน UI
  if (isLoading) return <div>กำลังโหลดข้อมูล...</div>;
  if (errorMessage) return <div className="text-red-500">เกิดข้อผิดพลาด: {errorMessage}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-800">จัดการประเภท</h1>

      {/* แถบค้นหาและปุ่มเพิ่ม */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchBarTable value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <div>
          <Button type="confirm-admin" onClick={() => openInputModal("create")}>
            เพิ่มประเภท
          </Button>
        </div>
      </div>

      {/* ตารางข้อมูลแท็ก */}
      <DataTable<Tag>
        data={filteredTags}
        columns={columns}
        getRowKey={(tag) => tag.id}
        actions={rowActions}
        theme="brand"
        striped
        className="bg-white rounded-lg w-full"
      />

      {/* Modal กรอกชื่อประเภท (สร้าง/แก้ไข) */}
      <TagModal
        isOpen={showInputModal}
        onClose={closeInputModal}
        onConfirm={handleInputModalConfirm}
        initialValue={modalType === "edit" ? selectedTag?.name : ""}
        existingTags={tags.map((tag) => tag.name)}
        errorMessage={submitError ?? ""}
      />

      {/* SweetAlert2 Modal ยืนยัน */}
      <ModalConfirm
        open={showConfirmModal}
        onConfirm={handleFinalConfirm}
        onCancel={() => {
          setShowConfirmModal(false);
          setPendingTagName("");
          setSelectedTag(null);
          setModalType(null);
        }}
        title={
          modalType === "delete"
            ? `ยืนยันการลบประเภท`
            : modalType === "edit"
              ? `ยืนยันการแก้ไขประเภท`
              : `ยืนยันการเพิ่มประเภท`
        }
        text={
          modalType === "delete"
            ? "คุณต้องการยืนยันการลบประเภทหรือไม่"
            : modalType == "edit"
              ? "คุณต้องการยืนยันการแก้ไขประเภทหรือไม่"
              : "คุณต้องการยืนยันการเพิ่มประเภทหรือไม่"
        }
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
      />
    </div>
  );
}
