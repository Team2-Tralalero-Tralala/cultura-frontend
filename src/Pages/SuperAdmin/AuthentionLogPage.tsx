/**
 * คำอธิบาย: Component สำหรับแสดงหน้าประวัติการเข้าใช้งาน (Authentication Log) หน้าที่แสดงรายการและค้นหา
 */
import BreadcrumbNavigation from "@/Components/BreadcrumbNavigation";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import DataTable from "@/Components/Tables/DataTable";
import React, { useState } from "react";
import type { Column, Pagination } from "../../Components/Tables/Types";

import FiltersForCM from "@/Components/Filters/Communities/FiltersForCM";
import { fetchAuthenticationLog } from "@/Libs/AuthenticationLogService";
import type { AuthenticationLogRow } from "@/Types/AuthenticationLog";

/**
 * คำอธิบาย: แปลงชื่อบทบาทเป็นภาษาไทย
 * Input: role (string) - บทบาทในระบบ (superadmin, admin, member, tourist)
 * Output: ชื่อบทบาทภาษาไทย (string)
 */
const thaiRoleName = (role: string) => {
  switch (role) {
    case "superadmin":
      return "ผู้ดูแลระบบ";
    case "admin":
      return "ผู้ดูแลชุมชน";
    case "member":
      return "สมาชิก";
    case "tourist":
      return "นักท่องเที่ยว";
    default:
      return role;
  }
};

/**
 * คำอธิบาย: แปลงวันที่และเวลาเป็นรูปแบบไทย
 * Input: loginTime (string | null) - วันที่และเวลาในรูปแบบ string หรือ null
 * Output: วันที่และเวลาในรูปแบบไทย (string) หรือ "-"
 */
const thaiLoginTime = (loginTime: string | null) => {
  if (!loginTime) return "-";
  return (
    new Date(loginTime).toLocaleString("th-TH", {
      year: "numeric",
      month: "short", // ใช้เดือนย่อ (เช่น ม.ค., ก.พ., ส.ค.)
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // ใช้เวลาแบบ 24 ชั่วโมง
    }) + " น."
  ); // ต่อท้ายด้วย "น."
};

// ====== คอลัมน์ตาราง ======
const columns: Column<AuthenticationLogRow>[] = [
  {
    key: "user",
    header: "ชื่อผู้ใช้",
    className: "min-w-[240px]",
    render: (row) => <div>{row.user.username}</div>,
  },
  {
    key: "role",
    header: "บทบาท",
    className: "min-w-[240px]",
    render: (row) => <div>{thaiRoleName(row.user.role.name)}</div>,
  },
  {
    key: "loginTime",
    header: "เวลาที่เข้าสู่ระบบ",
    render: (row) => thaiLoginTime(row.loginTime),
  },
  {
    key: "logoutTime",
    header: "เวลาที่ออกจากระบบ",
    render: (row) => thaiLoginTime(row.logoutTime),
  },
];

/**
 * คำอธิบาย: หน้าหลักสำหรับดูประวัติการเข้าใช้งานระบบ (Authentication Log)
 * Input: -
 * Output: React Component สำหรับแสดงผลหน้า Log
 */
export default function AuthentionLogPage() {
  // ====== state ตาราง ======
  const [rows, setRows] = React.useState<AuthenticationLogRow[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [pagination, setPagination] = React.useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const roleOptions = [
    { label: "ทั้งหมด", value: "all" },
    { label: "ผู้ดูแลระบบ", value: "superadmin" },
    { label: "ผู้ดูแลชุมชน", value: "admin" },
    { label: "สมาชิก", value: "member" },
    { label: "นักท่องเที่ยว", value: "tourist" },
  ];
  const [filterRole, setFilterRole] = useState(roleOptions[0].value);

  const [searchQuery, setSearchQuery] = React.useState("");

  /**
   * คำอธิบาย: ดึงข้อมูล Authentication Log จาก API
   * Input: - (ใช้ state ภายใน: pagination, searchQuery, filterRole)
   * Output: - (อัปเดต state rows และ pagination)
   */
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const {
        data: { data: resultData, pagination: resultPagination },
      } = await fetchAuthenticationLog(
        pagination.currentPage,
        pagination.limit,
        searchQuery,
        filterRole,
      );
      setRows(resultData);
      setPagination(resultPagination);
    } catch (error: any) {
      setErrorMessage(error?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [pagination.currentPage, pagination.limit, searchQuery, filterRole]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 w-full">
        <div>
          <BreadcrumbNavigation
            current={{
              label: "ประวัติการเข้าใช้งาน",
              to: "/super/logs",
              isFromSidebar: true,
            }}
          />
        </div>
        <h1 className="text-xl">ประวัติการเข้าใช้งาน</h1>
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex-1 max-w-md">
            <SearchBarTable
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
            />
          </div>
          <div>
            <FiltersForCM
              options={roleOptions}
              selected={filterRole}
              onChange={(value) => {
                setFilterRole(value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
            />
          </div>
        </div>
      </div>

      {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

      <DataTable<AuthenticationLogRow>
        data={rows}
        getKey={(row) => row.id.toString()}
        columns={columns}
        pageSizeOptions={[10, 30, 50]}
        onPageChange={(page) => {
          setPagination((prev) => ({ ...prev, currentPage: page }));
        }}
        onPageSizeChange={(pageSize) => {
          setPagination((prev) => ({
            ...prev,
            currentPage: 1,
            limit: pageSize,
          }));
        }}
        pagination={pagination}
        isLoading={isLoading}
      />
    </div>
  );
}
