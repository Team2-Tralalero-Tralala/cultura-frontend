import React, { useState } from "react";
import SearchBar from "./Components/Search/SearchBar";
import SearchBarTable from "./Components/Search/SerachBarTable";

/*
 * คำอธิบาย : Component หลักของระบบ สำหรับแสดงหน้า Search ตัวอย่าง
 * ประกอบด้วย SearchBar (Header) และ SearchBarTable (Table)
 */

function App() {
  const [query, setQuery] = useState("");

  const searchBar = (value: string) => {
    console.log("ค้นหาแพ็กเกจกิจกรรม:", value);
  };

  return (
    <div className="flex flex-col items-center p-4">
      {/* SearchBarHeader */}
      <SearchBar
        onSearch={searchBar}
        placeholder="ค้นหาแพ็กเกจกิจกรรม:"
      />
      {/* SearchBarTable */}
      <div className="mt-6 w-full max-w-md">
        <SearchBarTable
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
    </div>
  );
}

export default App;
