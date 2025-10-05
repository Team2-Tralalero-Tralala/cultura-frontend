import { useState } from "react";
import Sort, { type OptionItem } from "./Components/Sort";

type SortValue = "latest" | "recommended" | "price_asc" | "price_desc";

const sortOptions: OptionItem<SortValue>[] = [
  { value: "latest", label: "ล่าสุด" },
  { value: "recommended", label: "แนะนำ" },
  { value: "price_asc", label: "ราคาต่ำสุด" },
  { value: "price_desc", label: "ราคาสูงสุด" },
];

function App() {
  const [sort, setSort] = useState<SortValue>("latest");

  return (
    <div className="p-6 flex justify-start">
      <Sort value={sort} onChange={setSort} options={sortOptions} />
    </div>
  );
}

export default App;
