// /**
//  * จัดการที่พัก (Super Admin)
//  * - แสดงตารางที่พักในชุมชน
//  * - breadcrumb: จัดการชุมชน > [ชื่อชุมชน] > จัดการที่พัก
//  * - ปุ่มย้อนกลับ → กลับไปหน้ารายละเอียดชุมชน
//  */

// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { Icon } from "@iconify/react";
// import { TrashIcon } from "@/Components/Tables/Icon";
// import { Modal } from "@/Components/Modal/Modal";
// // Components
// import DataTable from "@/Components/Tables/Index";
// import SearchBarTable from "@/Components/Search/SearchBarTable";
// import Button from "@/Components/Button";

// // Services
// import { getHomestaysAll, deleteHomestay } from "@/Libs/HomestayService";
// import { getCommunityById } from "@/Libs/CommunityService";

// // Types
// import type { Column, DataTableActionsConfig, BulkAction } from "@/Components/Tables/Types";
// // import type { AxiosError } from "axios";

// // ================= Types =================
// type HomestayRow = {
//   id: number;
//   name: string;
//   facility: string;
//   type: string;
// };

// type HomestayFromApi = {
//   id: number;
//   name: string;
//   facility: string | null;
//   type: string | null;
// };

// // ================= Utility =================
// const normalizeText = (s: string) =>
//   (s ?? "")
//     .toString()
//     .toLowerCase()
//     .normalize("NFC")
//     .replace(/\s+/g, " ")
//     .trim();

// // ================= Component =================
// export default function ManageHomestaySuperAdmin() {
//   const { communityId } = useParams<{ communityId: string }>();
//   const navigate = useNavigate();

//   // ====== State ======
//   const [communityName, setCommunityName] = useState<string>("");
//   const [rows, setRows] = useState<HomestayRow[]>([]);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [pageSize, setPageSize] = useState<number>(10);
//   const [totalItems, setTotalItems] = useState<number>(0);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [openConfirm, setOpenConfirm] = useState(false);
//   const [deleteId, setDeleteId] = useState<number | null>(null);

//   // ====== โหลดชื่อชุมชน ======
//   useEffect(() => {
//     async function fetchCommunity() {
//       try {
//         if (!communityId) return;
//         const res = await getCommunityById(Number(communityId));
//         setCommunityName(res.data?.data?.name || "-");
//       } catch (error: unknown) {
//         if (error instanceof Error) console.error(error.message);
//         else console.error("Unknown error:", error);
//       }
//     }
//     fetchCommunity();
//   }, [communityId]);

//   // ====== โหลดข้อมูล Homestay ======
//   const reload = useCallback(async () => {
//     if (!communityId) return;
//     try {
//       setIsLoading(true);
//       setErrorMessage(null);

//       const res = await getHomestaysAll(
//         Number(communityId),
//         currentPage,
//         pageSize
//       );
//       const payload = res.data?.data;
//       console.log(res.data);
//       const list: HomestayFromApi[] = Array.isArray(payload?.data)
//         ? payload.data
//         : [];
//       const pg = payload?.pagination ?? {};

//       const mapped: HomestayRow[] = list.map((h) => ({
//         id: h.id,
//         name: h.name ?? "-",
//         facility: h.facility ?? "-",
//         type: h.type ?? "-",
//       }));

//       setRows(mapped);
//       setTotalItems(pg?.totalCount ?? mapped.length);
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         console.error(error.message);
//         setErrorMessage(error.message);
//       } else {
//         console.error(error);
//         setErrorMessage("โหลดข้อมูลไม่สำเร็จ");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   }, [communityId, currentPage, pageSize]);

//   useEffect(() => {
//     void reload();
//   }, [reload]);

//   // ====== คอลัมน์ตาราง ======
//   const columns: Column<HomestayRow>[] = [
//     {
//       key: "name",
//       header: "ชื่อที่พัก",
//       className: "min-w-[200px]",
//       render: (row) => (
//         <span className="text-dark-green font-medium">{row.name}</span>
//       ),
//     },
//     { key: "facility", header: "สิ่งอำนวยความสะดวก" },
//     { key: "type", header: "ประเภท" },
//   ];
//   const bulkActions: BulkAction<HomestayRow>[] = [
//     {
//       id: "bulk-delete",
//       label: "ลบทั้งหมด",
//       icon: TrashIcon,
//       intent: "neutral",
//       confirm: (rows) => `ยืนยันลบ ${rows.length} รายการหรือไม่?`,
//       onClick: async (rows) => {
//         const ids = rows.map((row) => row.id);
//         console.log("bulk delete:", ids);
//       },
//     },
//   ];
//   const handleDelete = async (homestayId: number) => {
//     await deleteHomestay(Number(homestayId));
//   };
//   // ====== Actions ต่อแถว ======
//   const rowActions: DataTableActionsConfig<HomestayRow> = {
//     header: "จัดการ",
//     align: "right",
//     width: "120px",
//     variant: "icons",
//     className: "pr-6",
//     items: () => ["edit", "delete"],
//     callbacks: {
//       edit: (row) =>
//         navigate(`/super/community/${communityId}/homestay/edit/${row.id}`),
//       delete: (row) => {
//         setDeleteId(row.id);
//         setOpenConfirm(true);
//       },
//     },
//   };

//   // ====== กรองข้อมูล ======
//   const filteredRows = useMemo(() => {
//     const q = normalizeText(searchQuery);
//     return rows.filter((row) =>
//       [row.name, row.facility, row.type].some((v) =>
//         normalizeText(v).includes(q)
//       )
//     );
//   }, [rows, searchQuery]);

//   // ================= Render =================
//   return (
//     <div className="space-y-4">
//       {/* Breadcrumb */}
//       <div className="px-6 pt-2 pb-1">
//         <nav
//           aria-label="breadcrumb"
//           className="flex items-center text-gray-700 text-sm"
//         >
//           <Link
//             to="/super/communities"
//             className="text-gray-800 hover:text-dark-green font-medium"
//           >
//             จัดการชุมชน
//           </Link>
//           <Icon
//             icon="mdi:chevron-right"
//             className="mx-2 text-gray-400 w-3.5 h-3.5"
//           />
//           <Link
//             to={`/super/community/detail/${communityId}`}
//             className="text-gray-800 hover:text-dark-green font-medium"
//           >
//             {communityName || "ชุมชน"}
//           </Link>
//           <Icon
//             icon="mdi:chevron-right"
//             className="mx-2 text-gray-400 w-3.5 h-3.5"
//           />
//           <span className="text-gray-500 font-medium">จัดการที่พัก</span>
//         </nav>
//       </div>

//       {/* <-- หัวข้อ */}
//       <div className="px-6 py-1 flex items-center justify-between">
//         <Link
//           to={`/super/community/detail/${communityId}`}
//           className="inline-flex items-center gap-2 text-gray-800 hover:text-dark-green"
//         >
//           <Icon icon="lucide:arrow-left" className="w-5 h-5" />
//           <h2 className="text-xl font-semibold">จัดการที่พัก</h2>
//         </Link>
//       </div>

//       {/* Toolbar: Search + Add */}
//       <div className="px-6 pb-2">
//         <div className="flex items-center gap-3">
//           <div className="max-w-md">
//             <SearchBarTable
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>

//           <div className="ml-auto">
//             <Button
//               onClick={() =>
//                 navigate(`/super/community/${communityId}/homestay/create`)
//               }
//               aria-label="เพิ่มที่พักใหม่"
//             >
//               <span>+ เพิ่มที่พัก</span>
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="px-6 pb-10">
//         {errorMessage && (
//           <div className="text-sm text-red-600 mb-2">{errorMessage}</div>
//         )}
//         <DataTable<HomestayRow>
//           data={filteredRows}
//           columns={columns}
//           getKey={(row) => String(row.id)}
//           actions={rowActions}
//           bulkActions={bulkActions}
//           selectable
//           pagination={{
//             currentPage,
//             totalPages: Math.ceil(totalItems / pageSize),
//             totalCount: totalItems,
//             limit: pageSize,
//           }}
//           onPageChange={(p) => setCurrentPage(p)}
//           onPageSizeChange={(size) => setPageSize(size)}
//           isLoading={isLoading}
//         />
//       </div>

//       {/* Modal ยืนยันการลบ จาก Modal ของ ญ*/}
//       <Modal
//         open={openConfirm}
//         title="ยืนยันการลบชุมชน"
//         text="คุณต้องการยืนยันการลบชุมชนหรือไม่"
//         onConfirm={async () => {
//           if (deleteId == null) return;
//           try {
//             await handleDelete(deleteId);
//             await reload();
//           } catch (error: unknown) {
//             let message = "unknown error";

//             // ตรวจสอบว่าเป็น Error ปกติ
//             if (error instanceof Error) {
//               message = error.message;
//             }
//             // ตรวจสอบว่าเป็น AxiosError
//             else if (
//               typeof error === "object" &&
//               error !== null &&
//               "response" in error &&
//               typeof (error as { response?: { data?: { message?: string } } })
//                 .response?.data?.message === "string"
//             ) {
//               message = (error as { response: { data: { message: string } } })
//                 .response.data.message;
//             }

//             console.error(error);
//             alert(`ลบไม่สำเร็จ: ${message}`);
//           } finally {
//             setOpenConfirm(false);
//             setDeleteId(null);
//           }
//         }}
//         onCancel={() => {
//           setOpenConfirm(false);
//           setDeleteId(null);
//         }}
//       />
//     </div>
//   );
// }

/*
 * คำอธิบาย : Component สำหรับ Super Admin ในการจัดการข้อมูลที่พักในแต่ละชุมชน
 * หน้าที่ : แสดง / ลบ / เพิ่ม / แก้ไขรายการที่พัก
 * Route : /super/community/:communityId/homestay
*/

import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { TrashIcon } from "@/Components/Tables/Icon";
import { Modal } from "@/Components/Modal/Modal";

// Components
import DataTable from "@/Components/Tables/Index";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import Button from "@/Components/Button";

// Services
import { getHomestaysAll, deleteHomestay } from "@/Libs/HomestayService";
import { getCommunityById } from "@/Libs/CommunityService";

// Types
import type {
  Column,
  DataTableActionsConfig,
  BulkAction,
} from "@/Components/Tables/Types";

// ================= Types =================
type HomestayFromApi = {
  id: number;
  name: string;
  facility: string | null;
  type: string | null;
};

type HomestayRow = {
  id: number;
  name: string;
  facility: string;
  type: string;
};

// ================= Utility =================
const normalizeText = (s: string) =>
  (s ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();

// ================= Component =================
export default function ManageHomestaySuperAdmin() {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();

  // ====== State ======
  const [communityName, setCommunityName] = useState<string>("");
  const [rows, setRows] = useState<HomestayRow[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [openConfirm, setOpenConfirm] = useState(false); // ลบเดี่ยว
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [openBulkConfirm, setOpenBulkConfirm] = useState(false); // ลบหลายแถว
  const [selectedRowsToDelete, setSelectedRowsToDelete] = useState<
    HomestayRow[]
  >([]);

  // ====== Load Community Name ======
  useEffect(() => {
    const fetchCommunity = async () => {
      if (!communityId) return;
      try {
        const res = await getCommunityById(Number(communityId));
        setCommunityName(res.data?.data?.name || "-");
      } catch (error) {
        console.error(error);
      }
    };
    void fetchCommunity();
  }, [communityId]);

  // ====== Load Homestay Data ======
  const fetchHomestays = async () => {
    if (!communityId) return;
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await getHomestaysAll(
        Number(communityId),
        currentPage,
        pageSize
      );
      const payload = res.data?.data;
      const list: HomestayFromApi[] = Array.isArray(payload?.data)
        ? payload.data
        : [];
      const mapped: HomestayRow[] = list.map((h) => ({
        id: h.id,
        name: h.name ?? "-",
        facility: h.facility ?? "-",
        type: h.type ?? "-",
      }));
      setRows(mapped);
      setTotalItems(payload?.pagination?.totalCount ?? mapped.length);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ"
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchHomestays();
  }, [communityId, currentPage, pageSize]);

  // ====== Error Helper ======
  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error !== null) {
      const err = error as { response?: { data?: { message?: string } } };
      return err.response?.data?.message ?? "unknown error";
    }
    return "unknown error";
  };

  /*
   * ฟังก์ชัน : confirmDelete
   * อธิบาย : ลบข้อมูลที่พักตาม id และรีโหลดข้อมูลใหม่
   * Input : id - หมายเลขโฮมสเตย์
   * Output : ไม่มี (เรียก fetchHomestays หลังสำเร็จ)
   */

  const confirmDelete = async (id: number) => {
    try {
      await deleteHomestay(id);
      await fetchHomestays();
    } catch (error: unknown) {
      alert(`เกิดข้อผิดพลาด: ไม่สามารถลบข้อมูลที่พักได้\n${getErrorMessage(error)}`);
      console.error(error);
    } finally {
      setOpenConfirm(false);
      setDeleteId(null);
    }
  };

  /*
   * ฟังก์ชัน : handleBulkDelete
   * อธิบาย : ลบข้อมูลที่พักหลายรายการพร้อมกัน (Bulk Delete)
   * Input : selectedRowsToDelete - รายการแถวที่ถูกเลือกเพื่อลบ
   * Process :
   *   - ตรวจสอบว่ามีรายการที่เลือกหรือไม่
   *   - ดึงรหัส (id) ของแต่ละรายการที่เลือก
   *   - ส่งคำขอลบไปยัง API ทุก id พร้อมกันด้วย Promise.all()
   *   - อัปเดตรายการ rows และจำนวน totalItems ใน state หลังจากลบสำเร็จ
   *   - แสดงข้อความแจ้งเตือนหากเกิดข้อผิดพลาด
   * Output : ไม่มี (อัปเดต state ภายใน component)
   */
  
  const handleBulkDelete = async () => {
    if (selectedRowsToDelete.length === 0) return;
    const ids = selectedRowsToDelete.map((r) => r.id);
    // console.log("Deleting bulk ids:", ids);
    try {
      await Promise.all(ids.map((id) => deleteHomestay(id)));
      setRows((prev) => prev.filter((row) => !ids.includes(row.id)));
      setTotalItems((prev) => prev - ids.length);
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ไม่สามารถลบข้อมูลที่พักได้\n${getErrorMessage(error)}`);
      console.error(error);
    } finally {
      setOpenBulkConfirm(false);
      setSelectedRowsToDelete([]);
    }
  };

  // ====== Columns ======
  const columns: Column<HomestayRow>[] = [
    {
      key: "name",
      header: "ชื่อที่พัก",
      className: "min-w-[200px]",
      render: (row) => (
        <span className="text-dark-green font-medium">{row.name}</span>
      ),
    },
    { key: "facility", header: "สิ่งอำนวยความสะดวก" },
    { key: "type", header: "ประเภท" },
  ];

  // ====== Bulk Actions ======
  const bulkActions: BulkAction<HomestayRow>[] = [
    {
      id: "bulk-delete",
      label: "ลบทั้งหมด",
      icon: TrashIcon,
      intent: "neutral",
      confirm: (rows) => `ยืนยันลบ ${rows.length} รายการหรือไม่?`,
      onClick: (selectedRows) => {
        if (selectedRows.length === 0) return;
        setSelectedRowsToDelete(selectedRows);
        setOpenBulkConfirm(true);
      },
    },
  ];

  // ====== Row Actions ======
  const rowActions: DataTableActionsConfig<HomestayRow> = {
    header: "จัดการ",
    align: "right",
    width: "120px",
    variant: "icons",
    className: "pr-6",
    items: () => ["edit", "delete"],
    callbacks: {
      edit: (row) =>
        navigate(`/super/community/${communityId}/homestay/edit/${row.id}`),
      delete: (row) => {
        setDeleteId(row.id);
        setOpenConfirm(true);
      },
    },
  };

  // ====== Filter ======
  const filteredRows = useMemo(() => {
    const q = normalizeText(searchQuery);
    return rows.filter((row) =>
      [row.name, row.facility, row.type].some((v) =>
        normalizeText(v).includes(q)
      )
    );
  }, [rows, searchQuery]);

  // ================= Render =================
  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="px-6 pt-2 pb-1">
        <nav
          aria-label="breadcrumb"
          className="flex items-center text-gray-700 text-sm"
        >
          <Link
            to="/super/communities"
            className="text-gray-800 hover:text-dark-green font-medium"
          >
            จัดการชุมชน
          </Link>
          <Icon
            icon="mdi:chevron-right"
            className="mx-2 text-gray-400 w-3.5 h-3.5"
          />
          <Link
            to={`/super/community/detail/${communityId}`}
            className="text-gray-800 hover:text-dark-green font-medium"
          >
            {communityName || "ชุมชน"}
          </Link>
          <Icon
            icon="mdi:chevron-right"
            className="mx-2 text-gray-400 w-3.5 h-3.5"
          />
          <span className="text-gray-500 font-medium">จัดการที่พัก</span>
        </nav>
      </div>

      {/* Header */}
      <div className="px-6 py-1 flex items-center justify-between">
        <Link
          to={`/super/community/detail/${communityId}`}
          className="inline-flex items-center gap-2 text-gray-800 hover:text-dark-green"
        >
          <Icon icon="lucide:arrow-left" className="w-5 h-5" />
          <h2 className="text-xl font-semibold">จัดการที่พัก</h2>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="px-6 pb-2 flex items-center gap-3">
        <div className="max-w-md">
          <SearchBarTable
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="ml-auto">
          <Button
            onClick={() =>
              navigate(`/super/community/${communityId}/homestay/create`)
            }
            aria-label="เพิ่มที่พักใหม่"
          >
            + เพิ่มที่พัก
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 pb-10">
        {errorMessage && (
          <div className="text-sm text-red-600 mb-2">{errorMessage}</div>
        )}
        <DataTable<HomestayRow>
          data={filteredRows}
          columns={columns}
          getKey={(row) => String(row.id)}
          actions={rowActions}
          bulkActions={bulkActions}
          selectable
          pagination={{
            currentPage,
            totalPages: Math.ceil(totalItems / pageSize),
            totalCount: totalItems,
            limit: pageSize,
          }}
          onPageChange={(p) => setCurrentPage(p)}
          onPageSizeChange={(size) => setPageSize(size)}
          isLoading={isLoading}
        />
      </div>

      {/* Modal Single Delete */}
      <Modal
        open={openConfirm}
        title="ยืนยันการลบที่พัก"
        text="คุณต้องการลบที่พักหรือไม่"
        onConfirm={() => deleteId != null && confirmDelete(deleteId)}
        onCancel={() => {
          setOpenConfirm(false);
          setDeleteId(null);
        }}
      />

      {/* Modal Bulk Delete */}
      <Modal
        open={openBulkConfirm}
        title="ยืนยันการลบหลายรายการ"
        text={`คุณต้องการลบ ${selectedRowsToDelete.length} รายการหรือไม่?`}
        onConfirm={handleBulkDelete}
        onCancel={() => {
          setOpenBulkConfirm(false);
          setSelectedRowsToDelete([]);
        }}
      />
    </div>
  );
}
