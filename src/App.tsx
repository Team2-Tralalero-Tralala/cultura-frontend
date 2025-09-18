import { DailyDate } from "./components/calendar/DailyDate";
import { WeeklyDate } from "./components/calendar/WeeklyDate";
import { MonthlyDate } from "./components/calendar/MonthlyDate";
import { DailyDateInput } from "./components/calendar/input_calendar/DailyDateInput";
import { CalendarTrigger } from "./components/calendar/input_calendar/set_type_calendar/CalendarTrigger";

function App() {
  return (
    <>
      <CalendarTrigger />
      
      <DailyDateInput />
      <DailyDate />
      <WeeklyDate />
      <MonthlyDate />
    </>
  );
}

export default App;
