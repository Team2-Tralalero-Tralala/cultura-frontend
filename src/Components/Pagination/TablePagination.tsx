import * as React from 'react';
import MuiTablePagination from '@mui/material/TablePagination';

export default function TablePagination() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const totalRowCount = 100;

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

return (
  <div className="space-y-1">
    <p className="text-sm text-gray-600">
      ทั้งหมด {totalRowCount} แถว
    </p>

    <div className="flex items-center justify-between"> 
      {/* ฝั่งซ้าย */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">จำนวนแถวต่อหน้า:</span>
        <MuiTablePagination
          component="div"
          count={totalRowCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 30, 50]}
          labelRowsPerPage=""
          sx={{
            p: 0,
            '& .MuiTablePagination-toolbar': {
              p: 0,
            },
            '& .MuiTablePagination-actions': {
              display: 'none', // ซ่อนปุ่ม next/prev ของส่วนนี้
            },
          }}
        />
      </div>

      
      <MuiTablePagination
        component="div"
        count={totalRowCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} จาก ${count}`}
        sx={{
          p: 0,
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-select': {
            display: 'none',
          },
        }}
      />
    </div>
  </div>
);



}