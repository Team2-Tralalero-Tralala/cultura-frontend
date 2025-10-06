import React from "react";
import TablePagination from './Components/Pagination/TablePagination';
import { PaginationRounded } from './Components/Pagination/PaginationRounded';

function App() {
  const totalData = 50;
  return (
    <div >
      <TablePagination totalData={totalData}/>
      <PaginationRounded />
    </div>
  );
}

export default App;
