import React from "react";
import DataPager from "./Components/Pagination/paginationForTable";

function App() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  return (
    <div>
      <DataPager
        totalCount={100}        // สมมุติว่ามีทั้งหมด 100 แถว
        pageSize={pageSize}     // จำนวนแถวต่อหน้า
        pageIndex={page}        // หน้าปัจจุบัน
        onPageIndexChange={setPage}        // callback เวลาเปลี่ยนหน้า
        onPageSizeChange={setPageSize}     // callback เวลาเปลี่ยนจำนวนแถวต่อหน้า
      />
    </div>
  );
}

export default App;
