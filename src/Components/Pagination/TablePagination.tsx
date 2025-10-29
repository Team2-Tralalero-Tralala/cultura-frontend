import * as React from 'react'; 
import MuiTablePagination from '@mui/material/TablePagination';

/* 
 * Component: TablePagination (Client)
 * คำอธิบาย: ใช้ควบคุมการแบ่งหน้า และจำนวนแถวต่อหน้าสำหรับตารางข้อมูล
 * Input:
 *   - totalData (number): จำนวนข้อมูลทั้งหมดในตาราง
 * Output:
 *   - แสดง UI tablepagination
 *   - เมื่อมีการเปลี่ยนหน้า/จำนวนต่อหน้า → ส่ง { page, limit } ออกไปให้ parent component ใช้โหลดข้อมูลจาก API
 */


type TablePaginationProps = {
  totalData: number; // จำนวนข้อมูลทั้งหมดที่ใช้คำนวณหน้า
  onQueryChange?: (query: { page: number; limit: number }) => void; // callback สำหรับส่งให้ parent เมื่อมีการเปลี่ยนหน้า/จำนวนต่อหน้า
};

export default function TablePagination({ totalData, onQueryChange }: TablePaginationProps) {
  const [page, setPage] = React.useState(0); // state เก็บหน้าปัจจุบัน
  const [rowsPerPage, setRowsPerPage] = React.useState(10); // state เก็บจำนวนแถวต่อหน้า

  /**
   * ฟังก์ชัน: handleChangePage
   * คำอธิบาย: เปลี่ยนหน้าปัจจุบัน (pagination)
   * Input:
   *   - event: การคลิกเปลี่ยนหน้า
   *   - newPage: หมายเลขหน้าใหม่
   * Output:
   *   - อัปเดต state page
   *   - onQueryChange({ page: newPage + 1, limit }) เพื่อให้ parent โหลดข้อมูลของหน้านั้น
   */
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage); // อัปเดตหมายเลขหน้าใหม่
    onQueryChange?.({ page: newPage + 1, limit: rowsPerPage }); // แจ้ง parent ให้โหลดข้อมูลหน้าที่เลือก
  };

  /**
   * ฟังก์ชัน: handleChangeRowsPerPage
   * คำอธิบาย: เปลี่ยนจำนวนแถวข้อมูลต่อหน้า
   * Input:
   *   - event: การเลือกจำนวนแถวจาก dropdown
   * Output:
   *   - อัปเดตจำนวนแถวต่อหน้า (rowsPerPage)
   *   - รีเซ็ตกลับไปหน้าแรก
   *   - onQueryChange({ page: 1, limit }) เพื่อให้ parent โหลดข้อมูลใหม่จาก API
   */
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const nextLimit = parseInt(event.target.value, 10); // แปลงค่าที่เลือกเป็นตัวเลข
    setRowsPerPage(nextLimit); // เซตจำนวนแถวต่อหน้าใหม่
    setPage(0); // รีเซ็ตหน้าให้กลับไปหน้าแรก
    onQueryChange?.({ page: 1, limit: nextLimit }); // แจ้ง parent ให้โหลดข้อมูลใหม่
  };

  // ส่วน UI ของ component
  return (
    <div className="space-y-1">
      {/* แสดงจำนวนข้อมูลทั้งหมด */}
      <p className="text-sm text-gray-600">ทั้งหมด {totalData} แถว</p>

      <div className="flex items-center justify-between">
        {/* ฝั่งซ้าย: ส่วนเลือกจำนวนแถวต่อหน้า */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">จำนวนแถวต่อหน้า :</span>

          <MuiTablePagination
            component="div"
            count={totalData} // จำนวนข้อมูลทั้งหมด
            page={page} // หน้าปัจจุบัน
            onPageChange={handleChangePage} // เมื่อเปลี่ยนหน้า
            rowsPerPage={rowsPerPage} // จำนวนแถวต่อหน้า
            onRowsPerPageChange={handleChangeRowsPerPage} // เมื่อเปลี่ยนจำนวนแถวต่อหน้า
            rowsPerPageOptions={[10, 30, 50]} // ตัวเลือกจำนวนแถว
            labelRowsPerPage="" // ซ่อน label
            labelDisplayedRows={() => null} // ไม่แสดงข้อความช่วงข้อมูล
            sx={{
              '& .MuiTablePagination-actions': {
                display: 'none', // ซ่อนปุ่ม next/prev ใน dropdown
              },
              '& .MuiInputBase-root': {
                borderRadius: '8px',
                border: '1px solid',
              },
            }}
            slotProps={{
              select: {
                MenuProps: {
                  MenuListProps: {
                    autoFocusItem: false,
                    sx: {
                      '& .MuiMenuItem-root': {
                        backgroundColor: '#fff',
                        color: '#000',
                      },
                      '& .MuiMenuItem-root:hover': {
                        backgroundColor: '#00BF6A',
                        color: '#fff',
                      },
                      '& .MuiMenuItem-root.Mui-selected': {
                        backgroundColor: '#fff',
                        color: '#000',
                      },
                      '& .MuiMenuItem-root.Mui-selected:hover': {
                        backgroundColor: '#00BF6A',
                        color: '#fff',
                      },
                      '& .MuiMenuItem-root.Mui-focusVisible': {
                        backgroundColor: '#fff',
                      },
                    },
                  },
                  PaperProps: {
                    autoFocusItem: false,
                    sx: {
                      borderRadius: '8px',
                      '& .MuiMenu-list': { padding: 0 },
                    },
                  },
                },
              },
            }}
          />
        </div>

        {/* ฝั่งขวา: แสดงช่วงข้อมูล (เช่น 1–10 จาก 100) */}
        <MuiTablePagination
          component="div"
          count={totalData}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} จาก ${count}`}
          sx={{
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-select': {
              display: 'none', // ซ่อน select ฝั่งขวา
            },
          }}
        />
      </div>
    </div>
  );
}
