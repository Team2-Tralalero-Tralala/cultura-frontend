import profileDefault from "./image/150fa8800b0a0d5633abc1d1c4db3d87.jpg";
// นำเข้ารูปภาพจากไฟล์ image ใน Components

// function สำหรับกรอกข้อมูลตัวอย่าง แสดงหน้าเว็ป
function App() {
  return (
    <CommunityCard
      name="ชุมชนบ้านห้วยไล่วัดกลางดอน"
      imageUrl={profileDefault}
    />
  );
}

// function สำหรับสร้าง card
// Child component
function CommunityCard(props: { name: string; imageUrl: string }) {
  return (
    <div className="flex flex-row justify-center mt-10">
      <div className="mx-2 w-40 h-50 bg-white rounded-xl border border-gray-200 overflow-hidden text-center p-4">
        <img
          className="mx-auto h-24 w-24 rounded-full bg-gray-300"
          src={props.imageUrl}
        />
        <h2 className="mt-3 text-base font-bold text-gray-800">{props.name}</h2>
      </div>
    </div>
  );
}

export default App;
