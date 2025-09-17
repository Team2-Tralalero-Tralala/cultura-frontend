import React from "react";
import Pagination from "./Components/Pagination/paginationForPackage";

function App() {
  const [page, setPage] = React.useState(1);

  return (
    <>
      <Pagination
        totalPages={100}
        currentPage={page}
        onPageChange={setPage}
      />
    </>
  );
}

export default App;
