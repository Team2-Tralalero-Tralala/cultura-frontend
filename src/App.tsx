import { Route, Routes } from "react-router";
import SuperAdminLayout from "@/Layouts/SuperAdmin/SuperAdminLayout";
import SuperAdminRoutes from "@/Layouts/SuperAdmin/SuperAdminRoutes";


function App() {
  return (
    <>
      <Routes>
        
        <Route
          path="/super/*"
          element={<SuperAdminLayout />}>
          <Route path="*" element={<SuperAdminRoutes />} />
        </Route>

        {/* fallback */}
      </Routes>
    </>
  );
}

export default App;