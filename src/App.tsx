  import React, { useState } from "react";
  import Sort from "./Components/Sort";

function App() {
  const [sort, setSort] = useState<
    "latest" | "recommended" | "price_asc" | "price_desc"
  >("latest");

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Hello world!</h1>

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600">เรียงตาม:</span>
        <Sort value={sort} onChange={setSort} />
      </div>

      <p className="text-sm text-slate-600">
        ค่าที่เลือกตอนนี้: <b>{sort}</b>
      </p>
    </div>
  );
}

export default App;
