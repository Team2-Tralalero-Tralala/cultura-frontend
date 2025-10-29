/**
 * จัดการประเภท (Super Admin)
 * - แสดงรายการประเภททั้งหมด
 * - สามารถค้นหา เพิ่ม แก้ไข ลบ ประเภทได้
 * - แสดงผลเป็นตารางพร้อม pagination
 * - ใช้งานร่วมกับ Modal เพื่อเพิ่มและแก้ไข
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Components
import Button from "@/Components/Button";
import DataTable from "@/Components/Tables/Index";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import TagModal from "@/Components/ModalTags";
import { Modal as ModalConfirm } from "@/Components/Modal/Modal";
import { TrashIcon } from "@/Components/Tables/Icon";

// Services
import { fetchTags, createTag, updateTag, deleteTag } from "@/Services/tag-service";

// Types ที่ใช้กับตาราง
import type {
  Column,
  DataTableActionsConfig,
  BulkAction,
  Pagination,
} from "@/Components/Tables/Types";

//Type ของ ข้อมูล Tag
export type Tag = {
  id: number;
  name: string;
};

//normalize string (เช่น สำหรับ search)
const normalizeText = (s: string) =>
  (s ?? "")
    .toString() //แปลงเป็น string
    .toLowerCase() //พิมพ์เล็กพิมพ์ใหญ่
    .normalize("NFC") //ปัญหาตัวอักษรที่หน้าตาเหมือนกันแต่ encoding ต่างกัน
    .replace(/\s+/g, " ") //แทนที่ช่องว่างหลายตัว
    .trim(); //ลบช่องว่างหน้าหลังของข้อความออก

//คอลัมน์
const columns: Column<Tag>[] = [
  { key: "name", header: "ชื่อแท็ก", className: "min-w-[200px]" },
];

export default function ManageTags() {
  const navigate = useNavigate();

  // state
  const [rows, setRows] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  const [showInputModal, setShowInputModal] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit" | "delete" | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingTagName, setPendingTagName] = useState("");

  // โหลดแท็กจาก api
  const loadTags = async () => {
    setIsLoading(true);
    try {

      const { data: resultData, pagination: resultPagination } = await fetchTags(
        pagination.currentPage,
        pagination.limit,
        searchQuery
      );
      setRows(resultData);
      setPagination(resultPagination);
    } catch (e) {
      setErrorMessage("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadTags();
  }, [pagination.currentPage, pagination.limit, searchQuery]);

  //ฟังก์ชันเปิด Modal เพิ่ม/แก้ไข
  const openInputModal = (type: "create" | "edit", tag: Tag | null = null) => {
    setModalType(type);
    setSelectedTag(tag);
    setShowInputModal(true);
    setPendingTagName(tag?.name ?? "");
  };
  // ปิด modal
  const closeInputModal = () => {
    setModalType(null);
    setSelectedTag(null);
    setShowInputModal(false);
    setPendingTagName("");
  };

  // ฟังก์ชันเปิด Modal ลบ
  const handleDelete = (tag: Tag) => {
    setSelectedTag(tag);
    setModalType("delete");
    setShowConfirmModal(true);
  };

  // ฟังก์ชันสำหรับจัดการ Create / Edit / Delete เมื่อกดยืนยันจาก modal
  const handleFinalConfirm = async () => {
    try {
      if (modalType === "create") {
        await createTag(pendingTagName);
      } else if (modalType === "edit" && selectedTag) {
        await updateTag(selectedTag.id, pendingTagName);
      } else if (modalType === "delete" && selectedTag) {
        await deleteTag(selectedTag.id);
      }

      // โหลดข้อมูลใหม่หลังจากมีการแก้ไข
      await loadTags();
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      setSelectedRows([]);
    } catch (e: any) {
      alert(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setShowConfirmModal(false);
      closeInputModal();
    }
  };
  // ค้นหาภายในหน้า
  const filteredRows = React.useMemo(() => {
    const q = normalizeText(searchQuery);
    if (!q) return rows;
    return rows.filter((tag) =>
      normalizeText(tag.name).includes(q)
    );
  }, [rows, searchQuery]);

  // กำหนด actions (edit, delete) สำหรับแต่ละแถว
  const rowActions: DataTableActionsConfig<Tag> = {
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

  //ลบหลายรายการพร้อมกัน
  const bulkActions: BulkAction<Tag>[] = [
    {
      id: "bulk-delete",
      label: "ลบทั้งหมด",
      icon: TrashIcon,
      intent: "danger",
      confirm: (rows) => `ยืนยันลบ ${rows.length} รายการหรือไม่?`,
      onClick: async (rows) => {
        const ids = rows.map((r) => r.id);
        alert("bulk delete: " + ids);
        await loadTags();
      },
    },
  ];

  return (

    //Render UI
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 text-gray-800 hover:text-dark-green">
        <h1 className="text-xl font-semibold text-gray-800">จัดการประเภท</h1>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchBarTable
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPagination((prev) => ({ ...prev, currentPage: 1 }));
          }}
        />
        <div>
          <Button onClick={() => openInputModal("create")}>+ เพิ่มประเภท</Button>
        </div>
      </div>

      {/* ตารางข้อมูล */}
      <DataTable<Tag>
        data={filteredRows}
        getKey={(row) => row.id.toString()}
        columns={columns}
        selectable={true}
        pageSizeOptions={[10, 20, 50]}
        onPageChange={(p) => {
          setPagination((prev) => ({ ...prev, currentPage: p }));
        }}
        onPageSizeChange={(p) => {
          setPagination((prev) => ({
            ...prev,
            currentPage: 1,
            limit: p,
          }));
        }}
        onSelectedChange={(rows) => {
          setSelectedRows(rows);
        }}
        pagination={pagination}
        isLoading={isLoading}
        actions={rowActions}
        bulkActions={bulkActions}
      />

      {/* Confirm Modal */}
      <ModalConfirm
        open={showConfirmModal}
        onConfirm={handleFinalConfirm}
        onCancel={() => {
          setShowConfirmModal(false);
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
      {/* Modal สำหรับกรอกชื่อประเภท (เพิ่ม / แก้ไข) */}
      <TagModal
        isOpen={showInputModal}
        onClose={closeInputModal}
        onConfirm={(name) => {
          setPendingTagName(name);
          setShowConfirmModal(true);
        }}
        initialValue={modalType === "edit" ? selectedTag?.name : ""}
        existingTags={rows.map((tag) => tag.name)}
        errorMessage=""
      />
    </div>
  );
}
