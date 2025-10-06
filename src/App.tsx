import React from "react";
import TablePagination from './Components/Pagination/TablePagination';
import PaginationRoundedForCardPackage  from './Components/Pagination/PaginationRoundedForCardPackage';

function App() {
  const totalData = 50;
  return (
    <div >
      <TablePagination totalData={totalData}/>
      <PaginationRoundedForCardPackage totalData={totalData}/>
    </div>
  );
}

export default App;
