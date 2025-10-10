// import { DailyDate } from "./components/calendar/DailyDate";
// import { WeeklyDate } from "./components/calendar/WeeklyDate";
// import { MonthlyDate } from "./components/calendar/MonthlyDate";
import { useState } from "react";
import { DailyDateInput } from "./components/calendar/input_calendar/DailyDateInput";
import { CalendarTrigger } from "./components/calendar/input_calendar/set_type_calendar/CalendarTrigger";
import { BEDateInput } from "./components/calendar/input_calendar/BoxDateInput";
import UploadCard from "./components/calendar/upload/UploadCard";
import { IMAGE_ICON, VIDEO_ICON } from "./components/calendar/upload/UploadIcons";


function App() {
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  return (
    <>
      <CalendarTrigger />
      <BEDateInput
        label="ปรับตามที่ต้องการ"
        width={600}
        height={40}
        placeholder="ปรับตามที่ต้องการ"
      />
      <DailyDateInput
        width={300}
        height={44}
        placeholder="วัน/เดือน/ปี"
      />

      
      <UploadCard
        max={5}
        accept="image/*"
        value={images}
        onChange={setImages}
        itemW={200}
        itemH={140}
        square={false}
        iconName={IMAGE_ICON}
      />

      <UploadCard
        max={5}
        accept="video/*"
        value={videos}
        onChange={setVideos}
        itemW={200}
        itemH={140}
        square={false}
        iconName={VIDEO_ICON}
      />

      {/* <DailyDate />
      <WeeklyDate />
      <MonthlyDate /> */}
    </>
  );
}

export default App;
