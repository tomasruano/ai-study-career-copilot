import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AppPage from "./pages/AppPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<AppPage />} />
      </Routes>
    </BrowserRouter>
  );
}