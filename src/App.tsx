import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreateAccountPage from "./Components/Account/CreateAccountPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-10">
        <Routes>
          <Route path="/" element={<CreateAccountPage />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
        </Routes>
      </div>

      <ToastContainer position="top-right" autoClose={2500} />
    </BrowserRouter>
  );
}

export default App;
