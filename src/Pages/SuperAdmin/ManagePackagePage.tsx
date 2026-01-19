/**
 * คำอธิบาย : หน้าสำหรับจัดการแพ็กเกจ (สำหรับ Superadmin) ทำหน้าที่แสดงรายการ ค้นหา และจัดการสถานะแพ็กเกจ
 */
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import DataTable from "@/Components/Tables/Index";
import type { Column, DataTableActionsConfig, BulkAction } from "../../Components/Tables/Types";
import { TrashIcon } from "../../Components/Tables/Icon";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import PackageFilter from "@/Components/Filters/Communities/FiltersStatusForCM";

const API_URL = import.meta.env.VITE_API_URL;

type PackageRowData = {
  packageId: number;
  title: string;
  community: string;
  owner: string;
  isPublished: boolean;
  isApproved: boolean;
  bookedCount: number;
  capacity: number;
};

/**
 * คำอธิบาย : ฟังก์ชันหลักสำหรับหน้าจัดการแพ็กเกจของผู้ดูแลระบบ (Super Admin)
 * Input : -
 * Output : JSX.Element (หน้าจอแสดงตารางรายการแพ็กเกจและการจัดการ)
 */
export default function ManagePackageSuperAdmin() {
  const navigate = useNavigate();

  const columns: Column<PackageRowData>[] = [
    {
      key: "title",
      header: "ชื่อแพ็กเกจ",
      className: "min-w-[240px]",
      /**
       * คำอธิบาย : Render ชื่อแพ็กเกจเป็นปุ่มที่คลิกได้
       * Input : packageData (ข้อมูลแถว)
       * Output : JSX Element (button)
       */
      render: (packageData) => (
        <button
          type="button"
          className="hover:underline text-left"
          onClick={() => navigate(`/super/package/${packageData.packageId}`)}
        >
          {packageData.title}
        </button>
      ),
    },
    { key: "community", header: "ชื่อชุมชน" },
    { key: "owner", header: "ผู้ดูแล" },
    {
      key: "isPublished",
      header: "สถานะแพ็กเกจ",
      render: (packageData) => (packageData.isPublished ? "เผยแพร่" : "ไม่เผยแพร่"),
    },
    {
      key: "bookingStats",
      header: "จำนวนการจอง",
      render: (packageData: any) => {
        return `${packageData.bookedCount || 0}/${packageData.capacity || 0}`;
      },
    },
  ];

  const [packageRows, setPackageRows] = React.useState<PackageRowData[]>([]);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [packageToDelete, setPackageToDelete] = useState<PackageRowData | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [packagesToBulkDelete, setPackagesToBulkDelete] = useState<PackageRowData[]>([]);
  const [filters, setFilters] = useState({ packageStatus: "ทั้งหมด", approvalStatus: "ทั้งหมด" });

  /**
   * คำอธิบาย : โหลดข้อมูลแพ็กเกจจาก API ตาม page และ limit ปัจจุบัน
   * Input : -
   * Output : -
   */
  const reloadPackages = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/super/packages`, {
        params: {
          page: currentPage, limit: pageSize,
          status: filters.packageStatus === "เผยแพร่" ? "PUBLISH" : filters.packageStatus === "ไม่เผยแพร่" ? "UNPUBLISH" : undefined,
          approve: filters.approvalStatus === "อนุมัติ" ? "APPROVE" : filters.approvalStatus === "รออนุมัติ" ? "PENDING" : filters.approvalStatus === "ถูกปฏิเสธ" ? "REJECTED" : undefined
        },
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      const responsePayload = response?.data;
      let rawDataList: any =
        responsePayload?.data?.data ??
        responsePayload?.data ??
        responsePayload?.items ??
        responsePayload?.rows ??
        responsePayload;

      if (!Array.isArray(rawDataList)) {
        console.warn("Expected array but got:", rawDataList);
        rawDataList = [];
      }

      const totalCount =
        responsePayload?.pagination?.totalCount ??
        responsePayload?.data?.pagination?.totalCount ??
        responsePayload?.total ??
        responsePayload?.totalCount ??
        rawDataList.length;

      const formattedPackageRows: PackageRowData[] = rawDataList.map(
        (packageItem: any): PackageRowData => ({
          packageId: Number(packageItem?.id ?? packageItem?.pk_id ?? 0),
          title: packageItem?.name ?? packageItem?.title ?? "-",
          community: packageItem?.community?.name ?? packageItem?.communityName ?? "-",
          owner: packageItem?.overseerPackage
            ? `${packageItem.overseerPackage.fname ?? ""} ${packageItem.overseerPackage.lname ?? ""
              }`.trim() ||
            packageItem.overseerPackage.username ||
            "-"
            : packageItem?.ownerName ?? "-",
          isPublished:
            packageItem?.statusPackage === "PUBLISH" ||
            packageItem?.published === true ||
            packageItem?.isPublished === true,
          isApproved:
            packageItem?.statusApprove === "APPROVE" ||
            packageItem?.approved === true ||
            packageItem?.isApproved === true,
          bookedCount: packageItem?.bookingHistories?.length ?? 0,
          capacity: packageItem?.capacity ?? 0,
        })
      );

      setPackageRows(formattedPackageRows);
      setTotalItems(
        Number.isFinite(totalCount) ? Number(totalCount) : formattedPackageRows.length
      );
    } catch (error: any) {
      console.error("reloadPackages error:", error?.response?.data ?? error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  /**
   * คำอธิบาย : Handler ที่ถูกเรียกเมื่อผู้ใช้กดยืนยันการลบจาก Modal
   * Input : -
   * Output : -
   */
  const handleConfirmDelete = useCallback(async () => {
    setIsDeleteModalOpen(false);
    if (packagesToBulkDelete.length > 0) {
      try {
        setIsLoading(true);
        const packageIdList = packagesToBulkDelete.map((packageData) => packageData.packageId);
        await Promise.all(
          packageIdList.map((packageId) =>
            axios.patch(`${API_URL}/super/package/${packageId}`, null, {
              withCredentials: true,
            })
          )
        );

        await reloadPackages();
        setPackagesToBulkDelete([]);
      } catch (error: any) {
        console.error("Bulk delete failed:", error);
        alert(`เกิดข้อผิดพลาดในการลบกลุ่ม: ${error?.message || "unknown error"}`);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    if (packageToDelete) {
      try {
        await axios.patch(`${API_URL}/super/package/${packageToDelete.packageId}`, null, {
          withCredentials: true,
        });
        await reloadPackages();
      } catch (error: any) {
        console.error("delete failed:", error);
        alert(`ลบไม่สำเร็จ: ${error?.message || "unknown error"}`);
      } finally {
        setPackageToDelete(null);
      }
    }
  }, [packageToDelete, packagesToBulkDelete, reloadPackages]);

  const bulkActions: BulkAction<PackageRowData>[] = React.useMemo(
    () => [
      {
        id: "bulk-delete",
        label: "ลบทั้งหมด",
        icon: TrashIcon,
        intent: "neutral",
        onClick: (selectedPackageRows) => {
          setPackagesToBulkDelete(selectedPackageRows);
          setIsDeleteModalOpen(true);
        },
      },
    ],
    []
  );

  const rowActions: DataTableActionsConfig<PackageRowData> = React.useMemo(
    () => ({
      header: "จัดการ",
      align: "left",
      width: "120px",
      variant: "icons",
      items: () => ["edit", "delete"],
      callbacks: {
        edit: (packageData) => navigate(`/super/package/${packageData.packageId}/edit`),
        delete: (packageData) => {
          setPackageToDelete(packageData);
          setIsDeleteModalOpen(true);
        },
      },
    }),
    [navigate]
  );

  React.useEffect(() => {
    reloadPackages();
  }, [reloadPackages]);

  const [searchQuery, setSearchQuery] = useState("");

  /**
   * คำอธิบาย : แปลงสตริงเป็น lowercase, normalize, และตัดช่องว่าง
   * Input : inputText (สตริงที่ต้องการแปลง)
   * Output : สตริงที่แปลงแล้ว
   */
  const normalizeText = (inputText: string) =>
    (inputText ?? "").toString().toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();

  /**
   * คำอธิบาย : แปลง boolean 'isPublished' เป็นข้อความ
   * Input : packageData (object ข้อมูล)
   * Output : สตริง "เผยแพร่" หรือ "ไม่เผยแพร่"
   */
  const toPublishedText = (packageData: PackageRowData) =>
    packageData.isPublished ? "เผยแพร่" : "ไม่เผยแพร่";

  /**
   * คำอธิบาย : แปลง boolean 'isApproved' เป็นข้อความ
   * Input : packageData (object ข้อมูล)
   * Output : สตริง "อนุมัติ" หรือ "รออนุมัติ"
   */
  const toApprovedText = (packageData: PackageRowData) =>
    packageData.isApproved ? "อนุมัติ" : "รออนุมัติ";

  const filteredPackageRows = React.useMemo(() => {
    const query = normalizeText(searchQuery);
    if (!query) return packageRows;
    return packageRows.filter((packageData) => {
      const haystacks = [
        packageData.title,
        packageData.community,
        packageData.owner,
        toPublishedText(packageData),
        toApprovedText(packageData),
      ].map(normalizeText);
      return haystacks.some((haystack) => haystack.includes(query));
    });
  }, [packageRows, searchQuery]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  /**
   * คำอธิบาย : ฟังก์ชันสำหรับนำทางไปยังหน้าคำขออนุมัติแพ็กเกจของผู้ดูแลระบบ
   * Input : -
   * Output : -
   */
  const navigateToApprovalRequests = () => navigate("/super/package-requests");

  /**
   * คำอธิบาย : กำหนดออบเจกต์การแบ่งหน้า (Pagination) สำหรับส่งให้ Component DataTable
   * Input : - (ใช้ currentPage, pageSize และ totalItems จาก state ภายใน Component)
   * Output : ออบเจกต์ pagination ที่ประกอบด้วย currentPage, totalPages, totalCount และ limit
   */
  const pagination = React.useMemo(
    () => ({
      currentPage,
      totalPages: Math.max(1, Math.ceil((totalItems || 0) / (pageSize || 10))),
      totalCount: totalItems,
      limit: pageSize,
    }),
    [currentPage, pageSize, totalItems]
  );

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div>
        <Breadcrumb
          current={{
            label: "จัดการแพ็กเกจ",
            to: `/super/packages/all`,
            fromSidebar: true,
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
                setFilters(prev => ({ ...prev, [type]: value }));
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Button type="confirm-admin" onClick={navigateToApprovalRequests}>
              คำขออนุมัติ
            </Button>
          </div>

        </div>
      </div>

      {/* ตาราง */}
      <DataTable<PackageRowData>
        data={filteredPackageRows}
        columns={columns}
        getKey={(packageData) => packageData.packageId.toString()}
        actions={rowActions}
        bulkActions={bulkActions}
        selectable
        pagination={pagination}
        pageSizeOptions={[10, 30, 50]}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        isLoading={isLoading}
        theme="brand"
      />

      {/* Modal สำหรับยืนยันการลบ */}
      <Modal
        open={isDeleteModalOpen}
        title="ยืนยันการลบแพ็กเกจ"
        text={`คุณต้องการยืนยันการลบแพ็กเกจหรือไม่`}
        confirmText="ยืนยันลบ"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setPackageToDelete(null);
        }}
      />
    </div>
  );
}
