import { useState } from "react";
import FiltersForCM from "../Components/Filters/Communitys/FiltersForCM";
import FiltersStatusForCM from "../Components/Filters/Communitys/FiltersStatusForCM";
import FiltersForTR from "../Components/Filters/Tourists/FiltersForTR";
import FiltersStatusForTR from "../Components/Filters/Tourists/FiltersStatusForTR";

function HomePage() {
  const [filter, setFilter] = useState("");
  // ตย.ตัวเลือกของวิสาหกิจชุมชน
  const optionsCM = [
    { label: "ทั้งหมด", value: "all" },
    { label: "สมาชิก", value: "member" },
    { label: "ผู้ใช้ทั่วไป", value: "guest" },
  ];
  // ตย.ตัวเลือกของนักท่องเที่ยว
  const optionsTR = [
    { label: "ล่าสุด", value: "lasted" },
    { label: "แนะนำ", value: "recommend" },
    { label: "ราคาต่ำไปสูง", value: "ASC" },
    { label: "ราคาสูงไปต่ำ", value: "DESC" },
  ];

  const handleFilterChange = (value: string) => {
    setFilter(value);
    console.log("เลือก:", value);
  };

  return (
    <div className="p-8 flex justify-start">
      <div className="flex flex-col">
        <FiltersForCM
          options={optionsCM}
          selected={filter}
          onChange={handleFilterChange}
        />
        <div className="mt-4">
          {filter === "all" && <p>แสดงข้อมูลทั้งหมด</p>}
          {filter === "member" && <p>แสดงเฉพาะสมาชิก</p>}
          {filter === "guest" && <p>แสดงเฉพาะผู้ใช้ทั่วไป</p>}
        </div>
      </div>
      <div className="px-5">
        <FiltersStatusForCM />
      </div>
      <div className="px-5">
        <FiltersForTR
          options={optionsTR}
          selected={filter}
          onChange={handleFilterChange}
        />
        <div className="mt-4">
          {filter === "lasted" && <p>แสดงแพ็กเกจล่าสุด</p>}
          {filter === "recommend" && <p>แสดงแพ็กเกจแนะนำ</p>}
          {filter === "ASC" && <p>แสดงแพ็กเกจราคาต่ำไปสูง</p>}
          {filter === "DESC" && <p>แสดงแพ็กเกจราคาสูงไปต่ำ</p>}
        </div>
      </div>
      <div className="px-5">
        <FiltersStatusForTR />
      </div>
    </div>
  );
}

export default HomePage;
