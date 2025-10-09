import CardPackage from "./Components/CardPackage";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-wrap justify-center gap-6 p-6">
      <CardPackage
        image="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop"
        title="เที่ยวชุมชนบ้านทุ่งสุขใจ"
        location="อำเภอปัว จังหวัดน่าน"
        bookingStatus="OPEN"
        bookingStart="2025-05-27"
        bookingEnd="2025-07-31"
        booked={23}
        capacity={50}
        tags={["ธรรมชาติ", "วัฒนธรรม", "โฮมสเตย์", "อาหารพื้นบ้าน"]}
        priceTHB={2500}
      />

      <CardPackage
        image="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop"
        title="แพ็กเกจท่องเที่ยวชุมชนบ้านปากคลองอันงดงามริมทะเลที่มีทั้งการทำประมงพื้นบ้านและสอนทำอาหารทะเลสดใหม่"
        location="หมู่ 5 ตำบลปากคลอง อำเภอเมืองระยอง จังหวัดระยอง ประเทศไทย"
        bookingStatus="OPEN"
        bookingStart="2025-05-27"
        bookingEnd="2025-07-31"
        booked={49}
        capacity={50}
        tags={["ชุมชนประมง", "ของฝากทะเล", "กิจกรรมกลางแจ้ง", "เรียนรู้วิถีชีวิต", "หัตถกรรม", "อาหารพื้นถิ่น"]}
        priceTHB={4800}
      />
    </div>
  );
}

export default App;
