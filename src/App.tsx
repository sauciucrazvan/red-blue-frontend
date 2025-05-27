import { lazy, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

const Dashboard = lazy(() => import("./pages/game_flow_pages/Dashboard.tsx"));
const Game = lazy(() => import("./pages/game_page/Game.tsx"));
const NotFound = lazy(() => import("./pages/system_pages/NotFound.tsx"));
const WaitingLobby = lazy(
  () => import("./pages/game_flow_pages/WaitingLobby.tsx")
);
const JoinPage = lazy(() => import("./pages/game_flow_pages/JoinPage.tsx"));
const FinishPage = lazy(() => import("./pages/game_flow_pages/FinishPage.tsx"));
const AdminPage = lazy(() => import("./pages/admin/AdminPage.tsx"));
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage.tsx"));
const AboutPage = lazy(() => import("./pages/system_pages/AboutPage.tsx"));

function ToastCleanup() {
  const location = useLocation();

  useEffect(() => {
    toast.remove(); // This clears all active toasts on route change
  }, [location]);

  return null; // No UI
}

export default function App() {
  return (
    <>
      <ToastCleanup />
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            backgroundColor: "#333",
            color: "white",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/game/:id" element={<Game />} />
        <Route path="/game/lobby/:id" element={<WaitingLobby />} />
        <Route path="/game/summary/:id" element={<FinishPage />} />
        <Route path="/game/join/:game_code" element={<JoinPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
