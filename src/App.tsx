import CardPackage from "./Components/CardPackage";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-wrap justify-center gap-6 p-6">
      <CardPackage
        image="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop"
        title="เที่ยวชุมชนบ้านทุ่งสุขใจ"
        location="อำเภอปัว จังหวัดน่าน"
        statusText="เปิดจองแล้ว วันที่ 27 พฤษภาคม  2568  ถึง 31 กรกฎาคม 2568"
        booked={23}
        capacity={50}
        tags={["ธรรมชาติ", "วัฒนธรรม", "โฮมสเตย์", "อาหารพื้นบ้าน"]}
        priceTHB={2500}
      />

      <CardPackage
        image="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop"
        title="แพ็กเกจท่องเที่ยวชุมชนบ้านปากคลองอันงดงามริมทะเลที่มีทั้งการทำประมงพื้นบ้านและสอนทำอาหารทะเลสดใหม่"
        location="หมู่ 5 ตำบลปากคลอง อำเภอเมืองระยอง จังหวัดระยอง ประเทศไทย"
        statusText="เปิดจองแล้ว วันที่ 27 พฤษภาคม  2568  ถึง 31 กรกฎาคม 2568"
        booked={49}
        capacity={50}
        tags={["ชุมชนประมง", "ของฝากทะเล", "กิจกรรมกลางแจ้ง", "เรียนรู้วิถีชีวิต", "หัตถกรรม", "อาหารพื้นถิ่น"]}
        priceTHB={4800}
      />

      <CardPackage
        image="https://images.unsplash.com/photo-1470770903676-69b98201ea1c?q=80&w=1200&auto=format&fit=crop"
        title="เดินป่าศึกษาธรรมชาติบ้านแม่กำปอง"
        location="อำเภอแม่ออน จังหวัดเชียงใหม่"
        statusText="เปิดจองแล้ว วันที่ 27 พฤษภาคม  2568  ถึง 31 กรกฎาคม 2568"
        booked={30}
        capacity={40}
        tags={[
          "ป่าเขา",
          "เดินป่า",
          "เรียนรู้วิถีชาวบ้าน",
          "โฮมสเตย์",
          "กาแฟดริป",
          "ของพื้นบ้าน",
          "ชุมชนยั่งยืน",
          "กิจกรรมธรรมชาติ",
        ]}
        priceTHB={3200}
      />

      <CardPackage
        image="https://images.unsplash.com/photo-1519821172141-b5d8cdd24e43?q=80&w=1200&auto=format&fit=crop"
        title="พักผ่อนสุดหรู ณ บ้านป่าบงเปียง วิวขั้นบันได"
        location="อำเภอแม่แจ่ม จังหวัดเชียงใหม่"
        statusText="เปิดจองแล้ว วันที่ 27 พฤษภาคม  2568  ถึง 31 กรกฎาคม 2568"
        booked={10}
        capacity={15}
        tags={["วิวภูเขา", "ที่พักหรู", "ธรรมชาติ", "โฮมสเตย์"]}
        priceTHB={12500}
      />
    </div>
  );
}

export default App;
