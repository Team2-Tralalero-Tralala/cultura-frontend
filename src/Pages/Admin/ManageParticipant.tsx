/**
 * คำอธิบาย: Component ManageParticipant (Admin) หน้าจัดการสมาชิกในแพ็กเกจ (Admin)
 * - แสดงตารางสมาชิกในแพ็กเกจ
 * - มีฟังก์ชันค้นหา อัปเดตสถานะการเข้าร่วมแพ็กเกจ
 */

import { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import DataTable from "@/Components/Tables/DataTable";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import type { Column, Pagination } from "@/Components/Tables/Types";
import { getParticipantsInPackage, updateParticipantStatus } from "@/Services/package-services";
import type { ParticipantsInPackage } from "@/Types/Package";

/**
 * คำอธิบาย: ฟังก์ชันที่ใช้ในการแปลงวันที่
 * input: dateObj - วันที่ที่ต้องการแปลง
 * output: วันที่ที่แปลงแล้ว
 */
const normalizeDate = (dateObj: Date | string) => {
  if (!dateObj) return "";
  const date = new Date(dateObj);
  const formattedDate = date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formattedDate} | เวลา ${formattedTime}`;
};
/**
 * คำอธิบาย: ฟังก์ชันที่ใช้ในการแสดง dropdown ของสถานะ
 * input: status - สถานะที่ต้องการแสดง
 *        disabled - สถานะของ dropdown
 *        onChange - ฟังก์ชันที่จะถูกเรียกเมื่อสถานะเปลี่ยนแปลง
 * output: dropdown ของสถานะ
 */
const StatusDropdown = ({
  status,
  disabled,
  onChange,
}: {
  status: boolean;
  disabled?: boolean;
  onChange: (val: boolean) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-1.5 border rounded-md shadow-sm text-sm transition-colors w-32 justify-between ${
          disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${status ? "bg-green-500" : "bg-red-500"} ${
              disabled ? "opacity-50" : ""
            }`}
          ></div>
          <span>{status ? "เข้าร่วม" : "ไม่เข้าร่วม"}</span>
        </div>
        {!disabled && <Icon icon="lucide:chevron-down" className="w-4 h-4 text-gray-400" />}
      </button>

      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 mt-1 w-full bg-white border rounded-md shadow-lg z-20 py-1">
            <button
              onClick={() => {
                onChange(false);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-left"
            >
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>ไม่เข้าร่วม</span>
            </button>
            <button
              onClick={() => {
                onChange(true);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-left"
            >
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>เข้าร่วม</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Component: ManageParticipant
 * input: -
 * output: ตารางสมาชิกในแพ็กเกจ
 */
export function ManageParticipant() {
  const [rows, setRows] = useState<ParticipantsInPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const params = useParams();

  /**
   * คำอธิบาย: ดึงข้อมูลบัญชีผู้ใช้ทั้งหมดจาก API
   * input: ไม่มี
   * output: ไม่มี
   */
  async function fetchData(): Promise<void> {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const { data: resultData, pagination: resultPagination } = await getParticipantsInPackage(
        Number(params.packageId),
        pagination.currentPage,
        pagination.limit,
        searchQuery
      );
      setRows(resultData);
      setPagination(resultPagination);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Fetch failed:", error);
      setErrorMessage(error.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * useEffect: โหลดข้อมูลเมื่อเปลี่ยนหน้า หรือค้นหา
   * input: pagination.currentPage, pagination.limit, searchQuery
   * output: ไม่มี
   */
  useEffect(() => {
    let isCancelled = false;
    const delay = setTimeout(async () => {
      try {
        setIsLoading(true);
        const { data: resultData, pagination: resultPagination } = await getParticipantsInPackage(
          Number(params.packageId),
          pagination.currentPage,
          pagination.limit,
          searchQuery
        );

        if (!isCancelled) {
          setRows(resultData);
          setPagination(resultPagination);
        }
      } catch (err) {
        const error = err as Error;
        if (!isCancelled) setErrorMessage(error.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(delay);
    };
  }, [pagination.currentPage, pagination.limit, searchQuery]);

  /**
   * คำอธิบาย: กำหนดคอลัมน์ของตาราง
   * input: ไม่มี
   * output: คอลัมน์ของตาราง
   */
  const columns = useMemo<Column<ParticipantsInPackage>[]>(
    () => [
      {
        key: "bookingId",
        header: "รหัสการจอง",
        className: "min-w-[40px]",
        render: (object) => (
          <Link
            to={`/super/account/${object.tourist?.id}`}
            onClick={(event) => event.stopPropagation()}
            className="hover:underline"
          >
            {`${object.id}`.trim() || "-"}
          </Link>
        ),
      },
      {
        key: "fullName",
        header: "ชื่อ-นามสกุล",
        className: "min-w-[200px]",
        render: (object) => (
          <div>
            {`${object.tourist?.fname ?? "-"} ${object.tourist?.lname ?? ""}`.trim() || "-"}
          </div>
        ),
      },
      {
        key: "bookingAt",
        header: "วันที่จองแพ็กเกจ",
        className: "min-w-[200px]",
        render: (object) => <div>{normalizeDate(object.bookingAt) ?? "-"}</div>,
      },
      {
        key: "phone",
        header: "เบอร์โทรศัพท์",
        className: "min-w-[160px]",
        render: (object) => <div>{object.tourist?.phone ?? "-"}</div>,
      },
      {
        key: "status",
        header: "จัดการ",
        className: "min-w-[100px]",
        align: "center",
        render: (object) => {
          const dueDate = new Date(object.package.dueDate);
          const now = new Date();
          // Logic: disable if (dueDate + 1 day) < now
          const oneDayAfterDue = new Date(dueDate);
          oneDayAfterDue.setDate(oneDayAfterDue.getDate() + 1);
          const isExpired = now > oneDayAfterDue;

          return (
            <div className="flex justify-start">
              <StatusDropdown
                status={object.isParticipate}
                disabled={isExpired}
                onChange={async (val) => {
                  try {
                    await updateParticipantStatus(object.id, val);
                    await fetchData();
                  } catch (err) {
                    console.error(err);
                    setErrorMessage("อัปเดตสถานะไม่สำเร็จ");
                  }
                }}
              />
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows]
  );

  // Section: Render Layout
  return (
    <div className="space-y-4">
      {/* Section: Header */}
      <div className="flex flex-col w-full">
        <div>
          <Breadcrumb
            current={{
              label: "จัดการสมาชิก",
              to: `/super/account/community/${params}`,
            }}
          />
        </div>
        <div className="flex justify-between items-center mb-3">
          <Link
            to={`/super/community/${params.communityId}`}
            className="inline-flex items-center gap-2 text-gray-800 hover:text-dark-green"
          >
            <Icon icon="lucide:arrow-left" className="w-5 h-5" />
            <h1 className="text-xl font-bold">รายชื่อผู้จอง</h1>
          </Link>
        </div>

        <div className="flex items-center justify-between w-full mt-2">
          {/* Section: Search + Filter */}
          <div className="flex items-center gap-2">
            <div className="w-[260px]">
              <SearchBarTable
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section: Error */}
      {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

      {/* Section: Table */}
      <DataTable<ParticipantsInPackage>
        data={rows}
        getKey={(row) => row.id.toString()}
        columns={columns}
        pageSizeOptions={[10, 30, 50]}
        pagination={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, currentPage: page }))}
        onPageSizeChange={(limit) => setPagination((prev) => ({ ...prev, currentPage: 1, limit }))}
        isLoading={isLoading}
        actions={undefined}
      />
    </div>
  );
}
