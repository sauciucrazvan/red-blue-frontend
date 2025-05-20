import { lazy, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Game = lazy(() => import("./pages/Game.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const WaitingLobby = lazy(() => import("./pages/WaitingLobby.tsx"));
const FinishPage = lazy(() => import("./pages/FinishPage.tsx"));

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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
