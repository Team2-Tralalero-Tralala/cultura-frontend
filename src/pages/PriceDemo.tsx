import { useState } from "react";
import PriceRange from "../Components/PriceRange";

export default function PriceDemo() {
  const [range, setRange] = useState({ min: 1000, max: 78500 }); // ตั้งค่าเริ่มต้นได้

  return (
    <div className="min-h-screen bg-fuchsia-200/30 p-6">
      <div className="mx-auto max-w-3xl">
        <PriceRange value={range} onChange={setRange} min={0} max={100000} step={100} />
      </div>
    </div>
  );
}
