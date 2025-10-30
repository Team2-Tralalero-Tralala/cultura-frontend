// src/Pages/SuperAdmin/ManageCommunitySuperAdmin.tsx
/**
 * จัดการชุมชน (Super Admin)
 * - แสดงตารางชุมชน: ชื่อชุมชน / จังหวัด / สถานะ / ผู้ดูแล
 * - ค้นหา, เลือกหลายแถว, ลบทั้งหมด
 * - ปุ่มแก้ไข/ลบ ต่อแถว
 */
import SearchBarTable from "@/Components/Search/SearchBarTable";
import DataTable from "@/Components/Tables/DataTable";
import React, { useState } from "react";
import type { BulkAction, Column, DataTableActionsConfig, Pagination } from "../../Components/Tables/Types";

import FiltersForCM from "@/Components/Filters/Communities/FiltersForCM";
import { fetchAuthenticationLog } from "@/Services/authenticationLog-services";
import type { AuthenticationLogRow } from "@/Types/AuthenticationLog";
import { TrashIcon } from "@/Components/Tables/Icon";

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
        render: (r) => <div>{r.user.username}</div>,
    },
    {
        key: "role",
        header: "บทบาท",
        className: "min-w-[240px]",
        render: (r) => <div>{thaiRoleName(r.user.role.name)}</div>,
    },
    {
        key: "loginTime",
        header: "เวลาที่เข้าสู่ระบบ",
        render: (r) => thaiLoginTime(r.loginTime),
    },
    {
        key: "logoutTime",
        header: "เวลาที่ออกจากระบบ",
        render: (r) => thaiLoginTime(r.logoutTime),
    },
];

export default function AuthentionLogSuperAdmin() {
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

    const optionsCM = [
        { label: "ทั้งหมด", value: "all" },
        { label: "ผู้ดูแลระบบ", value: "superadmin" },
        { label: "ผู้ดูแลชุมชน", value: "admin" },
        { label: "สมาชิก", value: "member" },
        { label: "นักท่องเที่ยว", value: "tourist" },
    ];
    const [filterRole, setFilterRole] = useState(optionsCM[0].value);

    const [searchQuery, setSearchQuery] = React.useState("");

    // ====== โหลดข้อมูล ======
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
                filterRole
            );
            setRows(resultData);
            setPagination(resultPagination);
        } catch (e: any) {
            setErrorMessage(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, [pagination.currentPage, pagination.limit, searchQuery, filterRole]);

    const [selectedRows, setSelectedRows] = useState<AuthenticationLogRow[]>([]);




    const rowActions: DataTableActionsConfig<AuthenticationLogRow> = {
        header: "จัดการ",
        align: "right",
        width: "120px",
        variant: "icons",
        items: () => ["edit", "delete"],
        callbacks: {
          edit: (row) => alert(`/${row.id}`),
          delete: async (row) => {
            if (!window.confirm(`ยืนยันลบแพ็กเกจ "${row.id}" ?`)) return;
            try {
              // สมมติ soft-delete
              alert("delete jaa");
              await fetchData();
            } catch (error: any) {
              console.error("delete failed:", error?.response?.data ?? error);
              alert(
                `ลบไม่สำเร็จ: ${
                  error?.response?.data?.message ||
                  error?.response?.data?.error ||
                  error?.message ||
                  "unknown error"
                }`
              );
            }
          },
        },
      }
    
    const bulkActions: BulkAction<AuthenticationLogRow>[] = [
      {
        id: "bulk-delete",
        label: "ลบทั้งหมด",
        icon: TrashIcon,
        intent: "danger",
        confirm: (rows) => `ยืนยันลบ ${rows.length} รายการหรือไม่?`,
        onClick: async (rows) => {
          const ids = rows.map((r) => r.id);
          alert("bulk delete:" + ids);
          await fetchData();
        },
      },
    ];


    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 w-full">
                <h2 className="text-sm">ประวัติการเข้าใช้งาน</h2>
                <h1 className="text-xl">ประวัติการเข้าใช้งาน</h1>
                {/* {JSON.stringify({pagination, searchQuery, filterRole})} */}
                {/* {JSON.stringify(selectedRows)} */}
                <div className="flex items-center justify-between gap-3 w-full">
                    <div className="flex-1 max-w-md">
                        <SearchBarTable
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value)
                              setPagination((prev) => ({ ...prev, currentPage: 1 }));
                            }}
                        />
                    </div>
                    <div>
                        <FiltersForCM
                            options={optionsCM}
                            selected={filterRole}
                            onChange={(value) => {
                              setFilterRole(value)
                              setPagination((prev) => ({ ...prev, currentPage: 1 }));
                            }}
                        />
                    </div>
                </div>
            </div>

            {errorMessage && (
                <div className="text-sm text-red-600">{errorMessage}</div>
            )}

            <DataTable<AuthenticationLogRow>
                data={rows}
                getKey={(row) => row.id.toString()}
                columns={columns}
                selectable={true}
                pageSizeOptions={[10, 30, 50]}
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
                    console.log("rows", rows);
                    setSelectedRows(rows);
                }}
                pagination={pagination}
                isLoading={isLoading}
                actions={rowActions}
                bulkActions={bulkActions}
            />
        </div>
    );
}
