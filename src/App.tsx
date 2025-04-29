import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import FinishPage from "./pages/FinishPage.tsx";

const Dashboard = lazy(() => import("./pages/Dashboard.tsx")),
  Game = lazy(() => import("./pages/Game.tsx")),
  NotFound = lazy(() => import("./pages/NotFound.tsx"));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/game/:id" element={<Game />} />
      <Route path="/result/:id" element={<FinishPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
