import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import LoadingPage from "../system_pages/Loading";
import ErrorPage from "../system_pages/ErrorPage";
import { API_URL } from "../../config";
import { FaCrown, FaThumbsDown, FaArrowLeftLong } from "react-icons/fa6";
import GameSummary from "../../components/GameSummary";
import { motion } from "framer-motion";

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
        if (_data.game_state !== "finished" && _data.game_state !== "abandoned")
          throw new Error("Game not finished");

        setData(_data);
        console.log(_data);
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

  // Sort players by score descending
  const players = [
    { name: data.player1_name, score: data.player1_score },
    { name: data.player2_name, score: data.player2_score },
  ].sort((a, b) => b.score - a.score);

  const renderPlayerCard = (name: string, score: number, index: number) => {
    const won = score > 0;
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          delay: 0.2 + index * 0.2,
          duration: 0.5,
          ease: "easeOut",
        }}
        className={`flex flex-col items-center backdrop-blur-md bg-white/10 border border-white/30 rounded-2xl p-6 w-64 text-white shadow-lg transition-all duration-300 ${
          won ? "scale-105 ring-4 ring-yellow-400" : "opacity-80"
        }`}
      >
        <h3 className="text-xl font-semibold mb-2 tracking-wide">{name}</h3>
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
      </motion.div>
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-red-700 to-blue-700 flex flex-col items-center justify-center px-6 py-12 text-white relative"
    >
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-5xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-yellow-300 drop-shadow-lg"
      >
        Game Over
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-lg sm:text-xl font-light italic text-white/85 mb-12 text-center max-w-xl drop-shadow-sm"
      >
        {message}
      </motion.p>

      {/* Player Cards */}
      <div className="flex flex-col sm:flex-row gap-8 items-center justify-center">
        {players.map((p, index) => renderPlayerCard(p.name, p.score, index))}
      </div>

      {/* Buttons */}
      <motion.div
        className="flex flex-col items-center mt-12 gap-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
      >
        <motion.button
          onClick={() => navigate("/")}
          className="bg-orange-500 hover:bg-orange-600 transition px-6 py-2 rounded-xl shadow-lg font-semibold flex items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <FaArrowLeftLong />
          Go to Dashboard
        </motion.button>

        <motion.button
          onClick={() => setShowSummary(true)}
          className="text-sm underline hover:text-orange-200 mt-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          View Game Summary
        </motion.button>
      </motion.div>

      {/* Game Time */}
      {data?.finished_at && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-sm mt-6 text-white/80"
        >
          This game took{" "}
          {(() => {
            const start = new Date(data.created_at);
            const end = new Date(data.finished_at);
            const diffMs = end.getTime() - start.getTime();
            const minutes = Math.floor(diffMs / 60000);
            const seconds = Math.floor((diffMs % 60000) / 1000);
            return `${minutes} minutes, ${seconds} seconds`;
          })()}{" "}
          to finish.
        </motion.div>
      )}

      {/* Game ID */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-xs mt-6 text-white/60"
      >
        Game ID: {id}
      </motion.div>

      {/* Summary Modal */}
      {showSummary && (
        <GameSummary
          player1Name={data.player1_name}
          player2Name={data.player2_name}
          rounds={data.rounds}
          onClose={() => setShowSummary(false)}
        />
      )}
    </motion.section>
  );
}
