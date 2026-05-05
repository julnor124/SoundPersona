import { BrowserRouter, Route, Routes } from "react-router-dom";
import CallbackPage from "./pages/CallbackPage";
import PredictorPage from "./pages/PredictorPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PredictorPage />} />
        <Route path="/callback" element={<CallbackPage />} />
      </Routes>
    </BrowserRouter>
  );
}
