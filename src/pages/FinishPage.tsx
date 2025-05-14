import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import LoadingPage from "./Loading";
import ErrorPage from "./ErrorPage";
import { API_URL } from "../config";
import { FaCrown, FaThumbsDown, FaArrowLeftLong } from "react-icons/fa6";
import GameSummary from "./components/GameSummary";

export default function FinishPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);

  const reason = searchParams.get("r");
  const message =
    reason === "abandon"
      ? "A player has abandoned the game."
      : "The game has finished — well played!";

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Invalid token.");

        const res = await fetch(`${API_URL}api/v1/game/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 404) return navigate("/404");
          throw new Error(res.statusText);
        }

        const _data = await res.json();
        if (_data.game_state !== "finished")
          throw new Error("Game not finished");

        setData(_data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [id]);

  if (loading) return LoadingPage();
  if (error || !data) return ErrorPage(error ?? "Failed to fetch data!");

  const renderPlayerCard = (name: string, score: number) => {
    const won = score >= 0;
    return (
      <div
        className={`flex flex-col items-center backdrop-blur-md bg-white/10 border border-white/30 rounded-2xl p-6 w-64 text-white shadow-lg transition-all duration-300 ${
          won ? "scale-105 ring-4 ring-yellow-400" : "opacity-80"
        }`}
      >
        <h3 className="text-xl font-semibold mb-2 tracking-wide">
          {name}
        </h3>
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center text-black text-xl mb-3 ${
            won ? "bg-yellow-400" : "bg-red-400"
          }`}
        >
          {won ? <FaCrown /> : <FaThumbsDown />}
        </div>
        <div
          className={`px-4 py-1 rounded-full font-mono text-sm ${
            won ? "bg-yellow-400" : "bg-red-400"
          } text-black`}
        >
          {score > 0 ? `+${score}` : score}
        </div>
      </div>
    );
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-red-700 to-blue-700 flex flex-col items-center justify-center px-6 py-12 text-white relative">
      {/* Title */}
      <h1 className="text-5xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-yellow-300 drop-shadow-lg">
        Game Over
      </h1>

      {/* Subtitle */}
      <p className="text-lg sm:text-xl font-light italic text-white/85 mb-12 text-center max-w-xl drop-shadow-sm">
        {message}
      </p>

      {/* Player Cards */}
      <div className="flex flex-col sm:flex-row gap-8 items-center justify-center">
        {renderPlayerCard(data.player1_name, data.player1_score)}
        {renderPlayerCard(data.player2_name, data.player2_score)}
      </div>

      {/* Buttons */}
      <div className="flex flex-col items-center mt-12 gap-3">
        <button
          onClick={() => navigate("/")}
          className="bg-orange-500 hover:bg-orange-600 transition px-6 py-2 rounded-xl shadow-lg font-semibold flex items-center gap-2"
        >
          <FaArrowLeftLong />
          Go to Dashboard
        </button>

        <button
          onClick={() => setShowSummary(true)}
          className="text-sm underline hover:text-orange-200 mt-1"
        >
          View Game Summary
        </button>
      </div>

      {/* Game ID */}
      <div className="text-xs mt-6 text-white/60">Game ID: {id}</div>

      {/* Summary Modal */}
      {showSummary && (
        <GameSummary
          player1Name={data.player1_name}
          player2Name={data.player2_name}
          rounds={data.rounds}
          onClose={() => setShowSummary(false)}
        />
      )}
    </section>
  );
}
