import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/public/Home/Home";
import AdminLogin from "./pages/admin/AdminLogin/AdminLogin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
