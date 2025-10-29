import React, { useState, useEffect, useCallback } from "react";
import DataTable from "@/Components/Tables/DataTable";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import Button from "@/Components/Button";
import ModalTag from "@/Components/Modal/ModalTag";
import { Modal as ModalConfirm } from "@/Components/Modal/Modal";
import { TrashIcon } from "@/Components/Tables/Icon";
import * as TagService from "@/Services/tag-service";

import type { Column, DataTableActionsConfig, BulkAction, Pagination } from "@/Components/Tables/Types";

export type TagRow = { id: number; name: string };

const normalizeText = (s: string) =>
    (s ?? "")
        .toString()
        .toLowerCase()
        .normalize("NFC")
        .replace(/\s+/g, " ")
        .trim();

export default function ManageTags() {
    // ====== table state ======
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

    // ====== modal state ======
    const [selectedTag, setSelectedTag] = useState<TagRow | null>(null);
    const [modalType, setModalType] = useState<"create" | "edit" | "delete" | null>(null);
    const [showInputModal, setShowInputModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingTagName, setPendingTagName] = useState("");

    // ====== load data + client-side search + pagination ======
    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            const res = await TagService.fetchTags(1, 1000); // โหลดทั้งหมด
            const data: TagRow[] = Array.isArray(res.data)
                ? res.data.map((t: any) => ({ id: t.id, name: t.name }))
                : [];

            // 🔍 filter search
            const filtered = data.filter((tag) =>
                normalizeText(tag.name).includes(normalizeText(searchQuery))
            );

            // pagination
            const pages = Math.max(1, Math.ceil(filtered.length / pagination.limit));
            const safePage = Math.min(pagination.currentPage, pages);
            const start = (safePage - 1) * pagination.limit;
            const end = start + pagination.limit;

            setRows(filtered.slice(start, end));
            setPagination((prev) => ({
                ...prev,
                totalCount: filtered.length,
                totalPages: pages,
                currentPage: safePage,
            }));
        } catch (e: any) {
            setErrorMessage(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
        } finally {
            setIsLoading(false);
        }
    }, [pagination.currentPage, pagination.limit, searchQuery]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ====== Modal / Actions ======
    const openInputModal = (type: "create" | "edit", tag: TagRow | null = null) => {
        setModalType(type);
        setSelectedTag(tag);
        setShowInputModal(true);
        setPendingTagName(tag?.name ?? "");
    };

    const closeInputModal = () => {
        setModalType(null);
        setSelectedTag(null);
        setShowInputModal(false);
        setPendingTagName("");
    };

    const handleDelete = (tag: TagRow) => {
        setSelectedTag(tag);
        setModalType("delete");
        setShowConfirmModal(true);
    };

    const handleFinalConfirm = async () => {
        try {
            if (modalType === "create") await TagService.createTag(pendingTagName);
            else if (modalType === "edit" && selectedTag) await TagService.updateTag(selectedTag.id, pendingTagName);
            else if (modalType === "delete" && selectedTag) await TagService.deleteTag(selectedTag.id);

            closeInputModal();
            setShowConfirmModal(false);
            await fetchData();
        } catch (e) {
            console.error(e);
        }
    };

    // ====== DataTable config ======
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

    const bulkActions: BulkAction<TagRow>[] = [
        {
            id: "bulk-delete",
            label: "ลบทั้งหมด",
            icon: TrashIcon,
            intent: "danger",
            confirm: (rows) => `ยืนยันลบ ${rows.length} รายการหรือไม่?`,
            onClick: async (rows) => {
                await Promise.all(rows.map((r) => TagService.deleteTag(r.id)));
                await fetchData();
            },
        },
    ];

    // ====== Render ======
    return (
        <div className="space-y-4 cursor-default">
            <div className="px-6 pt-2 pb-1">
                <nav aria-label="breadcrumb" className="flex items-center text-gray-700 text-sm">
                    <span className="text-gray-800 font-medium">จัดการประเภท</span>
                </nav>
            </div>

            <div className="px-6 py-1 flex items-center justify-between">
                <h2 className="text-xl font-semibold">จัดการประเภท</h2>
                <div>
                    <Button onClick={() => openInputModal("create")}>+ เพิ่มประเภท</Button>
                </div>
            </div>

            <div className="px-6 pb-2">
                <SearchBarTable
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPagination((prev) => ({ ...prev, currentPage: 1 }));
                    }}
                />
            </div>

            <div className="px-6 pb-10">
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
                    onPageChange={(p) => setPagination((prev) => ({ ...prev, currentPage: p }))}
                    onPageSizeChange={(size) => setPagination((prev) => ({ ...prev, currentPage: 1, limit: size }))}
                    pageSizeOptions={[10, 30, 50]}
                    theme="brand"
                />
            </div>

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

            {/* Input Modal */}
            <ModalTag
                isOpen={showInputModal}
                onClose={closeInputModal}
                onConfirm={(name) => {
                    setPendingTagName(name);
                    setShowConfirmModal(true);
                }}
                initialValue={modalType === "edit" ? selectedTag?.name : ""}
                existingTags={rows.map((t) => t.name)}
                errorMessage=""
            />
        </div>
    );
}
