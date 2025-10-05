import React from "react";
import TablePagination from './Components/Pagination/TablePagination';
import { PaginationRounded } from './Components/Pagination/PaginationRounded';

function App() {
  return (
    <div style={{ padding: 20 }}>
      <TablePagination />
      <PaginationRounded />
    </div>
  );
}

export default App;
