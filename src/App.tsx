import { Route, Routes, Navigate } from "react-router";
import { CreateCommuninityPage } from "./Page/super/CreateCommuninityPage";

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/super/community/create"
          element={<CreateCommuninityPage />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
