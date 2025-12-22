import React from "react";
import Pagination from "@mui/material/Pagination";

/*
 * Component: PaginationRoundedForCardPackage
 * คำอธิบาย: ใช้ควบคุมการแบ่งหน้าสำหรับการแสดงผล Card Packages
 * Input:
 *   - totalData (number): จำนวนข้อมูลทั้งหมดในตาราง
 * Output:
 *   - แสดง UI paginationRounded
 *   - เมื่อมีการเปลี่ยนหน้า/จำนวนต่อหน้า → ส่ง { page, limit } ออกไปให้ parent component ใช้โหลดข้อมูลจาก API
 */

type PaginationRoundedProps = {
  totalData: number; // จำนวนข้อมูลทั้งหมด
  limit?: number;
  onQueryChange?: (query: { page: number; limit: number }) => void; // callback สำหรับส่งให้ parent เมื่อมีการเปลี่ยนหน้า/จำนวนต่อหน้า
};

export default function PaginationRoundedForCardPackage({
  totalData,
  onQueryChange,
  limit = 9,
}: PaginationRoundedProps) {
  const [page, setPage] = React.useState(1); // เก็บหน้าปัจจุบัน
  const totalPages = Math.ceil(totalData / limit); // คำนวณจำนวนหน้าทั้งหมด

  /*
   * ฟังก์ชัน: handleChange
   * คำอธิบาย: เมื่อผู้ใช้เปลี่ยนหน้าจะอัปเดต state และแจ้ง parent
   * Input:
   *   - event: การคลิกเปลี่ยนหน้า
   *   - value: หมายเลขหน้าที่เลือก
   * Output:
   *   - setPage(value)
   *   - onQueryChange?.({ page: value, limit })
   */

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    onQueryChange?.({ page: value, limit });
  };

  return (
    <div>
      <Pagination
        count={totalPages}
        page={page}
        onChange={handleChange}
        variant="outlined"
        shape="rounded"
        sx={{
          "& .MuiPaginationItem-root": { borderColor: "#00BF6A" },
          "& .MuiPaginationItem-root.Mui-selected": {
            backgroundColor: "#00BF6A",
            color: "#fff",
            borderColor: "#00BF6A",
          },
          "& .MuiPaginationItem-root.Mui-selected.Mui-focusVisible": {
            backgroundColor: "#00BF6A",
          },
        }}
      />
    </div>
  );
}
