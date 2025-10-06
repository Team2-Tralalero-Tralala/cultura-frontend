import React from "react";
import TablePagination from "./Components/Pagination/TablePagination";
import PaginationRoundedForCardPackage from "./Components/Pagination/PaginationRoundedForCardPackage";
import PaginationRoundedForCardCommunity from "./Components/Pagination/PaginationRoundedForCardCommunity";

function App() {
  const totalData = 100; // จำลองข้อมูลทั้งหมด

  // รับ page, limit ที่เปลี่ยนแปลงจาก pagination components
  const handleQueryChange = (query: { page: number; limit: number }) => { 
    alert(`page: ${query.page}, limit: ${query.limit}`);
  };

  return (
    <div>
      <TablePagination totalData={totalData} onQueryChange={handleQueryChange} />
      <br />
      <PaginationRoundedForCardPackage totalData={totalData} onQueryChange={handleQueryChange} />
      <br />
      <PaginationRoundedForCardCommunity totalData={totalData} onQueryChange={handleQueryChange} />
      <br />
    </div>
  );
}

export default App;
