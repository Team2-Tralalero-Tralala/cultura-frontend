/**
 * คำอธิบาย : Component สำหรับจัดการสมาชิก (Admin) หน้าจอสำหรับค้นหา แสดงตาราง และจัดการสมาชิกในชุมชน
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DataTable from "@/Components/Tables/Index";
import type {
  Column,
  BulkAction,
  DataTableActionsConfig,
  Pagination as TablePagination,
} from "@/Components/Tables/Types";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import api from "@/Libs/Api";

type MemberRow = {
  userId: number;
  displayName: string;
  roleName: string;
  contact: string;
};

/**
 * คำอธิบาย: หน้าสำหรับจัดการสมาชิก (Admin)
 */
export default function ManageMemberPage() {
  const navigate = useNavigate();

  const [members, setMembers] = useState<MemberRow[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null);

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับแปลงข้อความเป็นตัวพิมพ์เล็กและตัดช่องว่าง
   * Input: textValue (string)
   * Output: ข้อความที่ผ่านการจัดรูปแบบแล้ว (string)
   */
  const normalizeText = (textValue: string) =>
    (textValue ?? "").toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();

  /**
   * คำอธิบาย: ตัวแปรสำหรับกรองข้อมูลสมาชิกตามคำค้นหา
   * Input: members, searchQuery
   * Output: รายการสมาชิกที่ตรงกับคำค้นหา
   */
  const filteredRows = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);
    if (!normalizedQuery) return members;

    return members.filter((member) =>
      [member.displayName, member.roleName, member.contact]
        .map(normalizeText)
        .some((fieldValue) => fieldValue.includes(normalizedQuery)),
    );
  }, [members, searchQuery]);

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับแปลงข้อมูลจาก API เป็นรูปแบบ MemberRow
   * Input: member (ข้อมูลดิบจาก API)
   * Output: ข้อมูลในรูปแบบ MemberRow
   */
  const mapApiToMemberRow = (member: any): MemberRow => {
    const displayName =
      [member.fname, member.lname].filter(Boolean).join(" ").trim() || member.username || "-";

    return {
      userId: Number(member.id),
      displayName,
      roleName: member.role?.name ?? "-",
      contact: member.email ?? member.phone ?? "-",
    };
  };

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับดึงข้อมูลสมาชิกทั้งหมดจาก API
   * Input: -
   * Output: - (มีการอัปเดต State ภายในฟังก์ชัน)
   */
  const fetchMembers = useCallback(async () => {
    try {
      setIsTableLoading(true);
      setFetchErrorMessage(null);

      const response = await api.get("/admin/member/all", {
        params: { page: currentPage, limit: pageSize },
      });

      const body = response.data?.data;
      const rows = Array.isArray(body?.data) ? body.data : [];
      const pagination = body?.pagination;

      setMembers(rows.map(mapApiToMemberRow));
      setTotalCount(Number(pagination?.totalCount ?? rows.length));
      setTotalPages(Number(pagination?.totalPages ?? 1));
    } catch (error: any) {
      setFetchErrorMessage(
        error?.response?.data?.message || error?.message || "โหลดข้อมูลสมาชิกไม่สำเร็จ",
      );
    } finally {
      setIsTableLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const columns = useMemo<Column<MemberRow>[]>(
    () => [
      {
        key: "displayName",
        header: "ชื่อบัญชี",
        className: "min-w-[220px]",
        render: (row) => (
          <div className="cursor-pointer" onClick={() => navigate(`/admin/member/${row.userId}`)}>
            {row.displayName}
          </div>
        ),
      },
      { key: "roleName", header: "บทบาท", className: "min-w-[140px]" },
      { key: "contact", header: "ช่องทางติดต่อ", className: "min-w-[220px]" },
    ],
    [navigate],
  );

  const actions: DataTableActionsConfig<MemberRow> = useMemo(
    () => ({
      header: <span className="block w-full text-center">จัดการ</span>,
      align: "right",
      width: "120px",
      variant: "icons",
      items: () => ["edit", "delete"],
      callbacks: {
        edit: (row) => navigate(`/admin/member/${row.userId}/edit`),
        delete: (row) => {
          setSelectedMember(row);
          setIsDeleteModalOpen(true);
        },
      },
    }),
    [navigate],
  );

  const bulkActions: BulkAction<MemberRow>[] = [];

  const pagination: TablePagination = {
    currentPage,
    totalPages,
    totalCount,
    limit: pageSize,
  };

  return (
    <>
      <Breadcrumb
        current={{
          label: "จัดการสมาชิก",
          to: "/admin/members",
          fromSidebar: true,
        }}
      />

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-[20px] font-bold">จัดการสมาชิก</h1>

          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-md">
              <SearchBarTable
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <div className="ml-auto">
              <Button type="confirm-admin" onClick={() => navigate("/admin/member/create")}>
                + สร้างสมาชิก
              </Button>
            </div>
          </div>
        </div>

        {fetchErrorMessage && <div className="text-sm text-red-600">{fetchErrorMessage}</div>}

        <DataTable<MemberRow>
          data={filteredRows}
          getKey={(row) => String(row.userId)}
          columns={columns}
          actions={actions}
          selectable
          bulkActions={bulkActions}
          theme="brand"
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50]}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          pagination={pagination}
          isLoading={isTableLoading}
        />
      </div>

      <Modal
        open={isDeleteModalOpen}
        title="ยืนยันการลบสมาชิก"
        text={`คุณต้องการลบสมาชิก “${selectedMember?.displayName ?? "-"}” ออกจากชุมชนใช่หรือไม่?`}
        confirmText="ลบ"
        cancelText="ยกเลิก"
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedMember(null);
        }}
        onConfirm={async () => {
          if (!selectedMember) return;

          try {
            await api.patch(`/admin/member/${selectedMember.userId}`, {});
            setIsDeleteModalOpen(false);
            setSelectedMember(null);
            await fetchMembers();
          } catch (error: any) {
            alert(error?.response?.data?.message || error?.message || "ลบสมาชิกไม่สำเร็จ");
          }
        }}
      />
    </>
  );
}
