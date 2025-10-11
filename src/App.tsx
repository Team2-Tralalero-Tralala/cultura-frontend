import { Route, Routes, Navigate } from "react-router";
import { CreateCommuninityPage } from "./Page/SuperAdmin/CreateCommuninityPage";
import { EditCommunityPage } from "./Page/SuperAdmin/EditCommunityPage";

function App() {
  return (
    <Routes>
      <Route path="super">
        <Route path="community">
          <Route path="create" element={<CreateCommuninityPage />} />
          <Route path="edit/:id" element={<EditCommunityPage />} />
        </Route>
      </Route>

      {/* ถ้าไม่ตรง route ไหนเลย → redirect กลับหน้าแรก */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
