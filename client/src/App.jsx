import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Dashboard from "./pages/admin/Dashboard";
import PatrolPoints from "./pages/admin/PatrolPoints";
import Guards from "./pages/admin/Guards";
import RoundManagement from "./pages/admin/Round";
import PatrolHistory from "./pages/admin/PatrolHistory";
import MonthlyHistory from "./pages/admin/MonthlyHistory";

import PatrolPage from "./pages/patrol/PatrolPage";

import AdminLayout from "./components/AdminLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===================== */}
        {/* PATROL */}
        {/* ===================== */}

        <Route path="/patrol" element={<PatrolPage />} />

        {/* ===================== */}
        {/* ADMIN */}
        {/* ===================== */}

        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />

          <Route path="points" element={<PatrolPoints />} />

          <Route path="guards" element={<Guards />} />
          <Route path="rounds" element={<RoundManagement />} />

          <Route path="history" element={<PatrolHistory />} />

          <Route path="monthly" element={<MonthlyHistory />} />
        </Route>
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </BrowserRouter>
  );
}
