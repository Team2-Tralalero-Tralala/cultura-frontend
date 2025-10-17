import React, { useState, useEffect, useCallback, useMemo } from "react";
import Button from "../Components/Button";
import SearchBarTable from "../Components/Search/SearchBarTable";
import DataTable from "../Components/Tables/Index";
import type {
  Column,
  DataTableActionsConfig,
  Pagination,
  BulkAction,
} from "../Components/Tables/Types";
import {
  getAllTags,
  createTag,
  updateTag,
  deleteTag as deleteTagAPI,
} from "../Libs/TagService";
import { TrashIcon } from "../Components/Tables/Icon";

import TagModal from "../Components/ModalTags";
import { Modal as ModalConfirm } from "../Components/Modal/Modal";

export type Tag = {
  id: number;
  name: string;
};

const columns: Column<Tag>[] = [
  { key: "name", header: "ชื่อแท็ก", className: "min-w-[200px]" },
];

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(""); // <-- คุณอาจยังใช้สำหรับ search later
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  const [selectedRows, setSelectedRows] = useState<Tag[]>([]);
  const [showInputModal, setShowInputModal] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit" | "delete" | null>(null);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingTagName, setPendingTagName] = useState<string>("");

  // fetch tags จาก backend พร้อม pagination params
  const fetchTags = useCallback(async (page = 1, limit = 15) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await getAllTags(page, limit); // ส่ง page และ limit ไปด้วย
      const tagsData = response.data.data as Tag[];

      if (!Array.isArray(tagsData)) throw new Error("API data is not an array");

      setTags(tagsData);

      const { currentPage, totalPages, totalCount, limit: limitFromAPI } = response.data.pagination;

      setPagination({
        currentPage,
        totalPages,
        totalCount,
        limit: limitFromAPI,
      });
    } catch (error: any) {
      setErrorMessage(error?.message ?? "ไม่สามารถโหลดข้อมูลแท็กได้");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // โหลดข้อมูลเมื่อหน้า หรือ limit เปลี่ยน
  useEffect(() => {
    fetchTags(pagination.currentPage, pagination.limit);
  }, [fetchTags, pagination.currentPage, pagination.limit]);

  const openInputModal = (type: "create" | "edit", tag: Tag | null = null) => {
    setModalType(type);
    setSelectedTag(tag);
    setShowInputModal(true);
  };

  const closeInputModal = () => {
    setShowInputModal(false);
    setSelectedTag(null);
    setModalType(null);
    setSubmitError(null);
  };

  const handleInputModalConfirm = (name: string) => {
    setPendingTagName(name);
    setShowConfirmModal(true);
  };

  const handleDelete = (tag: Tag) => {
    setSelectedTag(tag);
    setModalType("delete");
    setShowConfirmModal(true);
  };

  const handleFinalConfirm = async () => {
    try {
      if (modalType === "create") {
        await createTag(pendingTagName);
      } else if (modalType === "edit" && selectedTag) {
        await updateTag(selectedTag.id, pendingTagName);
      } else if (modalType === "delete" && selectedTag) {
        await deleteTagAPI(selectedTag.id);
      }
      // โหลดข้อมูลใหม่หลังแก้ไข
      await fetchTags(pagination.currentPage, pagination.limit);
      setSelectedRows([]);
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

  const bulkActions: BulkAction<Tag>[] = [
    {
      id: "bulk-delete",
      label: "ลบทั้งหมด",
      icon: TrashIcon,
      intent: "danger",
      confirm: (rows) => `ยืนยันลบ ${rows.length} รายการหรือไม่?`,
      onClick: async (rows) => {
        const confirmed = window.confirm(`ยืนยันลบ ${rows.length} รายการหรือไม่?`);
        if (!confirmed) return;
        try {
          for (const r of rows) {
            await deleteTagAPI(r.id);
          }
          await fetchTags(pagination.currentPage, pagination.limit);
          setSelectedRows([]);
        } catch (e: any) {
          alert(e.message || "ลบไม่สำเร็จ");
        }
      },
    },
  ];

  // **ตัด normalizeText, filteredTags, paginatedData ออกไป**

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-800">จัดการประเภท</h1>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchBarTable
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            // หากอยากทำ search server-side ในอนาคต สามารถใส่ logic ที่นี่ได้
            // ตอนนี้ยังไม่มี search server-side เลย ไม่ต้อง set page เป็น 1
          }}
        />
        <div>
          <Button type="confirm-admin" onClick={() => openInputModal("create")}>
            + เพิ่มประเภท
          </Button>
        </div>
      </div>

      <DataTable<Tag>
        data={tags} // ใช้ข้อมูลที่ได้จาก backend โดยตรง
        columns={columns}
        getKey={(tag) => String(tag.id)}
        actions={rowActions}
        bulkActions={bulkActions}
        selectable={true}
        pagination={pagination}
        pageSizeOptions={[10, 20, 50]}
        onPageChange={(p) => {
          setPagination((prev) => ({ ...prev, currentPage: p }));
        }}
        onPageSizeChange={(newLimit) => {
          setPagination((prev) => ({
            ...prev,
            currentPage: 1,
            limit: newLimit,
          }));
        }}
        onSelectedChange={(rows) => {
          setSelectedRows(rows);
        }}
        isLoading={isLoading}
      />

      <TagModal
        isOpen={showInputModal}
        onClose={closeInputModal}
        onConfirm={handleInputModalConfirm}
        initialValue={modalType === "edit" ? selectedTag?.name : ""}
        existingTags={tags.map((tag) => tag.name)}
        errorMessage={submitError ?? ""}
      />

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
            : modalType === "edit"
            ? "คุณต้องการยืนยันการแก้ไขประเภทหรือไม่"
            : "คุณต้องการยืนยันการเพิ่มประเภทหรือไม่"
        }
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
      />
    </div>
  );
}
