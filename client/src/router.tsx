import { BrowserRouter, Routes, Route } from "react-router";

import { Home } from "./pages/Home";
import { Auth } from "./pages/Auth";

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="auth" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  );
};
