// import { DailyDate } from "./components/calendar/DailyDate";
// import { WeeklyDate } from "./components/calendar/WeeklyDate";
// import { MonthlyDate } from "./components/calendar/MonthlyDate";
import { DailyDateInput } from "./components/calendar/input_calendar/DailyDateInput";
import { CalendarTrigger } from "./components/calendar/input_calendar/set_type_calendar/CalendarTrigger";
import { BEDateInput } from "./components/calendar/input_calendar/BoxDateInput";


function App() {
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
      {/* <DailyDate />
      <WeeklyDate />
      <MonthlyDate /> */}
    </>
  );
}

export default App;
