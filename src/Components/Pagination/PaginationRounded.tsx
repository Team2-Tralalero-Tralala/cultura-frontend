/*
 * คำอธิบาย : Component สำหรับแสดงปุ่มการแบ่งหน้า (Pagination)
 * ใช้ร่วมกับ Material UI โดยมีการปรับแต่งสีและรูปร่างให้เข้ากับธีมหลักของระบบ
 */

import React from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';


export function PaginationRounded() {
  return (
    <Stack spacing={2}>
      <Pagination
        count={10}
        variant="outlined"
        shape="rounded"
        sx={{
          '& .MuiPaginationItem-root': { borderColor: '#00BF6A' },
          '& .MuiPaginationItem-root.Mui-selected': {
            backgroundColor: '#00BF6A',
            color: '#fff',
            borderColor: '#00BF6A',
          },
          '& .MuiPaginationItem-root.Mui-selected.Mui-focusVisible': {
            backgroundColor: '#00BF6A',
          },
        }}
      />
    </Stack>
  );
}
