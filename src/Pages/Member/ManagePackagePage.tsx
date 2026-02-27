/**
 * คำอธิบาย: Component หน้าสำหรับจัดการแพ็กเกจ (สำหรับ admin)
 * - แสดงรายการแพ็กเกจทั้งหมดในรูปแบบตาราง
 * - รองรับการค้นหา, การแบ่งหน้า (Pagination)
 * - รองรับการลบ (เดี่ยว/กลุ่ม) และการแก้ไข
 */
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Icon } from "@iconify/react";
import PackageFilter from "@/Components/Filters/Communities/FiltersStatusForCM";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import BreadcrumbNavigation from "@/Components/BreadcrumbNavigation";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import DataTable from "@/Components/Tables/Index";
import type { Column, DataTableActionsConfig, BulkAction } from "../../Components/Tables/Types";
import { TrashIcon } from "../../Components/Tables/Icon";

const apiUrl = import.meta.env.VITE_API_URL;

type Row = {
  id: number;
  title: string;
  community: string;
  owner: string;
  published: boolean;
  statusApprove: string | null;
  bookedCount: number;
  capacity: number;
};

/*
 * คำอธิบาย : ฟังก์ชันหลักสำหรับหน้าจัดการแพ็กเกจของผู้ดูแลระบบ (Super Admin)
 * Input: -
 * Output : JSX.Element (หน้าจอแสดงตารางรายการแพ็กเกจและการจัดการ)
 */
export function ManagePackagePage() {
  const navigate = useNavigate();

  /*
   * คำอธิบาย: Render ชื่อแพ็กเกจเป็นปุ่มที่คลิกได้
   * Input: row - ข้อมูลแถว
   * Output: JSX Element (button)
   */
  const columns: Column<Row>[] = [
    {
      key: "title",
      header: "ชื่อแพ็กเกจ",
      className: "min-w-[240px]",
      render: (row) => (
        <button
          type="button"
          className="hover:underline text-left"
          onClick={() => navigate(`/member/package/${row.id}`)}
        >
          {row.title}
        </button>
      ),
    },
    { key: "owner", header: "ผู้ดูแล" },
    {
      key: "published",
      header: "สถานะแพ็กเกจ",
      render: (row) => (row.published ? "เผยแพร่" : "ไม่เผยแพร่"),
    },
    {
      key: "statusApprove",
      header: "สถานะการอนุมัติ",
      render: (row) => toApprovedText(row),
    },
    {
      key: "bookingStats",
      header: "จำนวนการจอง",
      render: (packageData: any) => {
        return `${packageData.bookedCount || 0}/${packageData.capacity || 0}`;
      },
    },
  ];
  const [packageRows, setPackageRows] = React.useState<Row[]>([]);
  const [pagination, setPagination] = React.useState({
    currentPage: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [rowToDelete, setRowToDelete] = useState<Row | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rowsToBulkDelete, setRowsToBulkDelete] = useState<Row[]>([]);
  const [filters, setFilters] = useState({ packageStatus: "ทั้งหมด", approvalStatus: "ทั้งหมด" });


  /*
   * คำอธิบาย : (Callback) โหลดข้อมูลแพ็กเกจจาก API ตาม page และ limit ปัจจุบัน
   * Input: - (ใช้ currentPage, pageSize จาก state)
   * Output : (void) - อัปเดต tableRows, totalItems, และ isLoading state
   */
  const fetchPackages = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${apiUrl}/member/packages`, {
        params: {
          page: pagination.currentPage, limit: pagination.limit,
          status: filters.packageStatus === "เผยแพร่" ? "PUBLISH" : filters.packageStatus === "ไม่เผยแพร่" ? "UNPUBLISH" : undefined,
          approve: filters.approvalStatus === "อนุมัติ" ? "APPROVE" : filters.approvalStatus === "ถูกปฏิเสธ" ? "REJECTED" : undefined
        },
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      const payload = response?.data;
      let rawDataList: any =
        payload?.data?.data ?? payload?.data ?? payload?.items ?? payload?.rows ?? payload;

      if (!Array.isArray(rawDataList)) {
        console.warn("Expected array but got:", rawDataList);
        rawDataList = [];
      }

      const totalCount =
        payload?.pagination?.totalCount ??
        payload?.data?.pagination?.totalCount ??
        payload?.total ??
        payload?.totalCount ??
        rawDataList.length;

      const mappedPackageRows: Row[] = rawDataList.map(
        (packageItem: any): Row => ({
          id: Number(packageItem?.id ?? packageItem?.pk_id ?? 0),
          title: packageItem?.name ?? packageItem?.title ?? "-",
          community: packageItem?.community?.name ?? packageItem?.communityName ?? "-",
          owner: packageItem?.overseerPackage
            ? `${packageItem.overseerPackage.fname ?? ""} ${
                packageItem.overseerPackage.lname ?? ""
              }`.trim() ||
              packageItem.overseerPackage.username ||
              "-"
            : (packageItem?.ownerName ?? "-"),
          published:
            packageItem?.statusPackage === "PUBLISH" ||
            packageItem?.published === true ||
            packageItem?.isPublished === true,
          statusApprove: packageItem?.statusApprove ?? null,
          bookedCount: packageItem?.bookingHistories?.length ?? 0,
          capacity: packageItem?.capacity ?? 0,
        }),
      );

      setPackageRows(mappedPackageRows);
      setPagination((prev) => ({
        ...prev,
        totalCount: Number.isFinite(totalCount) ? Number(totalCount) : mappedPackageRows.length,
        totalPages: Math.max(
          1,
          Math.ceil(
            (Number.isFinite(totalCount) ? Number(totalCount) : mappedPackageRows.length) /
              prev.limit,
          ),
        ),
      }));
    } catch (error: unknown) {
      console.error("reloadPackages error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, filters]);

  /*
     * คำอธิบาย : (Callback) Handler ที่ถูกเรียกเมื่อผู้ใช้กดยืนยันการลบจาก Modal
     * รองรับการลบแบบรายการเดียวและแบบกลุ่ม
     * Input : - (ใช้ rowToDelete หรือ rowsToBulkDelete จาก state)
     * Output : (void) - (async) เรียก API ลบ, แสดง alert, และโหลดข้อมูลใหม่
     */
  const handleConfirmDelete = useCallback(async () => {
    setIsDeleteModalOpen(false);

    // กรณีลบแบบกลุ่ม (Bulk Delete)
    if (rowsToBulkDelete.length > 0) {
      try {
        setIsLoading(true);
        const packageIdList = rowsToBulkDelete.map((row) => row.id);

        // ยิง API ลบทีละรายการ (ใช้ Promise.all เพื่อรอให้เสร็จทั้งหมด)
        await Promise.all(
          packageIdList.map((packageId) =>
            axios.patch(
              `${apiUrl}/member/package/${packageId}`,
              null,
              { withCredentials: true }
            )
          )
        );

        await fetchPackages();
        setRowsToBulkDelete([]); // เคลียร์รายการที่เลือก
      } catch (error: any) {
        console.error("Bulk delete failed:", error);
        alert(`เกิดข้อผิดพลาดในการลบกลุ่ม: ${error?.message || "unknown error"}`);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // กรณีลบรายการเดียว (Single Delete) - Logic เดิม
    if (rowToDelete) {
      const rowId = rowToDelete.id;
      const rowTitle = rowToDelete.title;

      try {
        await axios.patch(
          `${apiUrl}/member/package/${rowId}`,
          null,
          { withCredentials: true }
        );

        await fetchPackages();
      } catch (error: any) {
        console.error("delete failed:", error?.response?.data ?? error);
        alert(
          `ลบไม่สำเร็จ (${rowTitle}): ${error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "unknown error"
          }`
        );
      } finally {
        setRowToDelete(null);
      }
    }
  }, [rowToDelete, rowsToBulkDelete, fetchPackages]);

  const bulkActions: BulkAction<Row>[] = React.useMemo(
    () => [
      {
        id: "bulk-delete",
        label: "ลบทั้งหมด",
        icon: TrashIcon,
        intent: "neutral",
        onClick: (selectedRows) => {
          setRowsToBulkDelete(selectedRows);
          setIsDeleteModalOpen(true);
        },
      },
    ],
    []
  );

  const rowActions: DataTableActionsConfig<Row> = React.useMemo(
    () => ({
      header: "จัดการ",
      align: "left",
      width: "120px",
      variant: "icons",
      items: () => ["edit", "delete"],
      callbacks: {
        edit: (row) => navigate(`/member/package/${row.id}/edit`),
        delete: (row) => {
          setRowToDelete(row);
          setIsDeleteModalOpen(true);
        },
      },
    }),
    [navigate],
  );

  React.useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);
  const [searchQuery, setSearchQuery] = useState("");

  /**
   * คำอธิบาย: แปลงสตริงเป็น lowercase, normalize, และตัดช่องว่าง
   * Input: text - สตริงที่ต้องการแปลง
   * Output: สตริงที่แปลงแล้ว
   */
  const normalizeText = (text: string) =>
    (text ?? "").toString().toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();

  /**
   * คำอธิบาย: แปลง boolean 'published' เป็นข้อความ
   * Input: row - object ข้อมูล
   * Output: สตริง "เผยแพร่" หรือ "ไม่เผยแพร่"
   */
  const toPublishedText = (row: Row) => (row.published ? "เผยแพร่" : "ไม่เผยแพร่");

  /**
   * คำอธิบาย: แปลง boolean 'approved' เป็นข้อความ
   * Input: row - object ข้อมูล
   * Output: สตริง "อนุมัติ" หรือ "รออนุมัติ"
   */
  const toApprovedText = (row: Row) => {
    switch (row.statusApprove) {
      case "APPROVE":
        return "อนุมัติ";
      case "REJECTED":
        return "ถูกปฏิเสธ";
      case "PENDING":
      case "PENDING_SUPER":
        return "รออนุมัติ";
      default:
        return "-";
    }
  };

  const filteredRows = React.useMemo(() => {
    const query = normalizeText(searchQuery);
    if (!query) return packageRows;
    return packageRows.filter((row) => {
      const haystacks = [
        row.title,
        // row.community,
        row.owner,
        toPublishedText(row),
        toApprovedText(row),
      ].map(normalizeText);
      return haystacks.some((haystack) => haystack.includes(query));
    });
  }, [packageRows, searchQuery]);

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, [searchQuery]);

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับนำทางไปยังหน้าคำขออนุมัติแพ็กเกจของผู้ดูแลระบบ
   * Input: -
   * Output: - (นำผู้ใช้ไปยังหน้า "/member/package-requests")
   */
  const goToApprovalRequests = () => navigate("/member/package-requests");

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับนำทางไปยังหน้าสร้างแพ็กเกจของผู้ดูแลระบบ
   * Input: -
   * Output: - (นำผู้ใช้ไปยังหน้า "/member/package/create")
   */
  const goToCreatePackage = () => navigate("/member/package/create");

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div>
        <BreadcrumbNavigation
          current={{
            label: "จัดการแพ็กเกจ",
            to: `/member/packages/all`,
            isFromSidebar: true,
          }}
        />
      </div>

      {/* หัวข้อและช่องค้นหา */}
      <div className="flex flex-col gap-2 -mt-3">
        <h1 className="text-xl font-bold">จัดการแพ็กเกจ</h1>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 max-w-md">
              <SearchBarTable
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <PackageFilter
              currentFilters={filters}
              onFilterChange={(type: string, value: string) => {
                setFilters((prev) => ({ ...prev, [type]: value }));
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Button type="confirm-admin" onClick={goToCreatePackage}>
              <div className="flex items-center justify-center gap-2 px-1">
                <Icon
                  icon="material-symbols:add-rounded"
                  className="text-2xl" // ปรับขนาดไอคอนประมาณ 24px
                />
                <span className="whitespace-nowrap font-medium text-base pb-0.5">
                  เพิ่มแพ็กเกจ
                </span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* ตาราง */}
      <DataTable<Row>
        data={filteredRows}
        columns={columns}
        getKey={(row) => row.id.toString()}
        actions={rowActions}
        bulkActions={bulkActions}
        selectable
        pagination={pagination}
        pageSizeOptions={[10, 30, 50]}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, currentPage: page }))}
        onPageSizeChange={(size) => { setPagination((prev) => ({ ...prev, limit: size, currentPage: 1 })); }}
        isLoading={isLoading}
        theme="brand"
      />

      <Modal
        isOpen={isDeleteModalOpen}
        title="ยืนยันการลบแพ็กเกจ"
        text={`คุณต้องการยืนยันการลบแพ็กเกจหรือไม่`}
        confirmText="ยืนยันลบ"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setRowToDelete(null);
        }}
      />
    </div>
  );
}
