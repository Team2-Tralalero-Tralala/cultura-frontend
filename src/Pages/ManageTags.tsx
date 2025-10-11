import React, { useState, useEffect, useCallback, useMemo } from "react";
import Button from "../Components/Button";
import SearchBarTable from "../Components/Search/SerachBarTable";
import DataTable from "../Components/Tables/Index";
import Modal from "../Components/ModalTags";
import type { Column, DataTableActionsConfig } from "../Components/Tables/Types";
import {
  getAllTags,
  createTag,
  updateTag,
  deleteTag as deleteTagAPI,
} from "../Libs/TagService";

//ย้าย type Tag มาไว้ตรงนี้แทนการ import จากไฟล์ภายนอก
export type Tag = {
  id: number;
  name: string;
};


const columns: Column<Tag>[] = [
  {
    key: "name",
    header: "ชื่อแท็ก",
    className: "min-w-[200px]",
  },
];

const useRowActions = (reload: () => void): DataTableActionsConfig<Tag> => ({
  header: "จัดการ",
  align: "left",
  width: "120px",
  variant: "icons",
  items: () => ["edit", "delete"],
  callbacks: {
    edit: async (row) => {
      const newName = window.prompt("แก้ไขชื่อแท็ก:", row.name);
      if (!newName || newName.trim() === "" || newName.trim() === row.name) return;
      try {
        await updateTag(row.id, newName.trim());
        reload();
      } catch (error) {
        console.error("Error updating tag:", error);
        alert("อัปเดตแท็กไม่สำเร็จ");
      }
    },
    delete: async (row) => {
      if (!window.confirm(`ยืนยันลบแท็ก "${row.name}" ?`)) return;
      try {
        await deleteTagAPI(row.id);
        reload();
      } catch (error) {
        console.error("Error deleting tag:", error);
        alert("ลบแท็กไม่สำเร็จ");
      }
    },
  },
});

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchTags = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await getAllTags();
      const data = response.data as Tag[];
      setTags(data);
    } catch (error: any) {
      console.error("Failed to fetch tags:", error);
      setErrorMessage(error?.message ?? "ไม่สามารถโหลดข้อมูลแท็กได้");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const rowActions = useRowActions(fetchTags);

  const handleCreateTag = async (newTag: string) => {
    try {
      const payloadName = newTag.trim();
      if (!payloadName) {
        alert("ชื่อแท็กไม่สามารถเป็นค่าว่าง");
        return;
      }

      const response = await createTag(payloadName);
      const newCreated = response.data as Tag;
      setTags((prev) => [...prev, newCreated]);
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Failed to create tag:", error);
      alert(error?.message ?? "เพิ่มแท็กไม่สำเร็จ");
    }
  };

  const normalizeText = (s: string) =>
    (s ?? "").toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();

  const filteredTags = useMemo(() => {
    const q = normalizeText(searchQuery);
    if (!q) return tags;
    return tags.filter((tag) => normalizeText(tag.name).includes(q));
  }, [tags, searchQuery]);

  if (isLoading) {
    return <div>กำลังโหลดข้อมูล...</div>;
  }

  if (errorMessage) {
    return <div className="text-red-500">เกิดข้อผิดพลาด: {errorMessage}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-gray-800">จัดการประเภท</h1>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <SearchBarTable
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="confirm-admin" onClick={() => setIsModalOpen(true)}>
            เพิ่มประเภท
          </Button>
        </div>

        <div className="w-full">
          <DataTable<Tag>
            data={filteredTags}
            columns={columns}
            getRowKey={(tag) => tag.id}
            actions={rowActions}
            theme="brand"
            striped
            className="bg-white rounded-lg w-full"
          />
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleCreateTag}
        />
      </div>
    </div>
  );
}
