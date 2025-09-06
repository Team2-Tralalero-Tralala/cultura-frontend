import { DailyDate } from "./components/calendar/DailyDate";
import { WeeklyDate } from "./components/calendar/WeeklyDate";
import { MonthlyDate } from "./components/calendar/MonthlyDate";

function App() {
  return (
    <>
      <h1 className="text-5xl font-bold underline">Hello world!</h1>
      <DailyDate />
      <WeeklyDate />
      <MonthlyDate/>
    </>
  );
}

export default App;
