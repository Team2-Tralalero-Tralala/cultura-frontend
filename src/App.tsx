import Card_package from "./Components/CardPackage";

function App() {
  return (
    <>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <Card_package
        image="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop"
        title="ชื่อแพ็กเกจ"
        location="ที่อยู่ของชุมชน (เขต/ตำบล จังหวัด)"
        statusText="เปิดจองแพ็กเกจช่วงเวลา"
        booked={0}
        capacity={50}
        tags={["ข้อความ", "ข้อความ", "ข้อความ", "ข้อความ"]}
        priceTHB={0}
      />
    </>
  );
}

export default App;
