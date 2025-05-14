// Game.tsx complet refactorizat cu timer centrat
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import LoadingPage from "./Loading";
import WaitingLobby from "./WaitingLobby";
import ChatPopup from "./components/ChatPopup";
import GameSummary from "./components/GameSummary";
import { toastErrorWithSound } from "./components/toastWithSound";
import { AnimatePresence } from "framer-motion";
import { API_URL, WS_URL } from "../config";
import soundFile from "../assets/pop-up-notify-smooth-modern-332448.mp3";
import { FiCheckCircle } from "react-icons/fi";

const roundStartSound = new Audio(soundFile);

function getInterpolatedColor(timer: number): string {
  const t = timer / 60;
  let r, g, b;
  if (t > 0.5) {
    const ratio = (t - 0.5) * 2;
    r = 59 + (139 - 59) * (1 - ratio);
    g = 130 + (92 - 130) * (1 - ratio);
    b = 246;
  } else {
    const ratio = t * 2;
    r = 139 + (239 - 139) * (1 - ratio);
    g = 92 + (68 - 92) * (1 - ratio);
    b = 246 + (68 - 246) * (1 - ratio);
  }
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

const Game = () => {
  const prevRoundRef = useRef<number | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showSurrenderPopup, setShowSurrenderPopup] = useState(false);
  const [timer, setTimer] = useState<number>(60);

  const handleChoice = (color: string) => {
    if (selectedColor) {
      toastErrorWithSound("Wait for your opponent!");
      return;
    }
    setSelectedColor(color);
    chooseColor(color);
  };

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Invalid token.");
        const response = await fetch(`${API_URL}api/v1/game/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          if (response.status === 404) navigate("/404");
          throw new Error(response.statusText);
        }
        const data = await response.json();
        setData(data);
        setPlayerName(
          localStorage.getItem("role") === "player1"
            ? data.player1_name
            : data.player2_name
        );
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchGame();
  }, [id, navigate]);

  useEffect(() => {
    let ws: WebSocket;
    const initializeWebSocket = () => {
      try {
        ws = new WebSocket(`${WS_URL}ws/game/${id}`);
        ws.onmessage = (event) => {
          try {
            const wsData = JSON.parse(event.data);
            if (wsData.game_state === "finished")
              navigate(`/summary/${id}?r=finish`);
            if (wsData.next_round) {
              setData((prev: any) => ({
                ...prev,
                current_round: wsData.next_round,
                player1_score: wsData.player1_score,
                player2_score: wsData.player2_score,
                rounds: wsData.rounds,
              }));
              setSelectedColor(null);
            }
          } catch (err) {
            console.error("Failed to parse WebSocket message:", err);
          }
        };
      } catch (err) {
        console.error("WebSocket initialization error:", err);
        setError("Failed to initialize WebSocket");
      }
    };
    initializeWebSocket();
  }, [id, navigate]);

  useEffect(() => {
    if (!data?.current_round) return;
    const prevRound = prevRoundRef.current;
    const currentRound = data.current_round;
    if (prevRound !== null && currentRound > prevRound && currentRound !== 1) {
      roundStartSound.currentTime = 0;
      roundStartSound.volume = 0.5;
      roundStartSound
        .play()
        .catch((e) => console.error("Sound play error:", e));
    }
    prevRoundRef.current = currentRound;
  }, [data?.current_round]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (data?.game_state === "waiting") return;
      const round = data?.rounds?.[data?.current_round - 1];
      if (!round?.created_at) return;
      const createdTime = new Date(round.created_at).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - createdTime) / 1000);
      const remaining = 60 - elapsed;
      setTimer(remaining > 0 ? remaining : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const chooseColor = async (choice: string) => {
    try {
      const response = await fetch(
        `${API_URL}api/v1/game/${id}/round/${data?.current_round || 1}/choice`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            game_id: id,
            round_number: data?.current_round || 1,
            player_name: playerName,
            choice,
            token: localStorage.getItem("token"),
          }),
        }
      );
      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(errorDetail.detail || response.statusText);
      }
      await response.json();
    } catch (error: any) {
      console.error("Error choosing color:", error.message);
      setError(`Failed to submit choice: ${error.message}`);
    }
  };

  const abandonGame = async () => {
    try {
      await fetch(`${API_URL}api/v1/game/${id}/abandon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_id: id,
          player_name: playerName,
          token: localStorage.getItem("token"),
        }),
      });
    } catch (error: any) {
      console.error("Error abandoning the game:", error.message);
      setError(`Failed to submit choice: ${error.message}`);
    } finally {
      navigate(`/summary/${id}?r=abandon`);
    }
  };

  if (loading) return LoadingPage();
  if (error) return ErrorPage(error);
  if (!data) return ErrorPage("Failed to fetch data!");
  if (!data.player1_name || !data.player2_name)
    return (
      <WaitingLobby
        id={id!}
        game_code={data.code}
        created_at={data.created_at}
      />
    );

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-br from-red-700 to-blue-700 text-white overflow-y-auto px-4 py-4">
      <div className="bg-black/20 backdrop-blur-md border border-black/20 p-8 rounded-3xl shadow-2xl w-full max-w-5xl flex flex-col items-center relative gap-8">
        <h2 className="text-3xl font-bold text-white">
          Round {data.current_round}
        </h2>

        <div className="flex justify-between items-center gap-12 w-full max-w-5xl px-10">
          <div className="flex-1 flex justify-end">
            <div className="bg-white/10 backdrop-blur-md p-4 px-6 rounded-2xl text-center shadow-md w-full max-w-xs">
              <div className="text-white text-lg font-semibold mb-1">
                {data.player1_name}
              </div>
              <div
                className={`text-3xl font-bold ${
                  data.player1_score >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {data.player1_score >= 0 ? "+" : ""}
                {data.player1_score} pts
              </div>
              <div className="italic text-sm text-white/60">
                {data.player1_score >= 0 ? "Winning" : "Losing"}
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <div className="relative w-40 h-40">
              <svg className="absolute top-0 left-0 w-full h-full">
                <circle
                  cx="50%"
                  cy="50%"
                  r="70"
                  stroke={getInterpolatedColor(timer)}
                  strokeWidth="15"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 70}
                  strokeDashoffset={2 * Math.PI * 70 * ((60 - timer) / 60)}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-white">
                {timer}
              </div>
            </div>
          </div>

          <div className="flex-1 flex justify-start">
            <div className="bg-white/10 backdrop-blur-md p-4 px-6 rounded-2xl text-center shadow-md w-full max-w-xs">
              <div className="text-white text-lg font-semibold mb-1">
                {data.player2_name}
              </div>
              <div
                className={`text-3xl font-bold ${
                  data.player2_score >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {data.player2_score >= 0 ? "+" : ""}
                {data.player2_score} pts
              </div>
              <div className="italic text-sm text-white/60">
                {data.player2_score >= 0 ? "Winning" : "Losing"}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 w-full max-w-5xl mt-6 px-10 z-10">
          {["RED", "BLUE"].map((color) => (
            <div
              key={color}
              onClick={() => handleChoice(color)}
              className={`relative transition-all duration-300 rounded-xl text-center text-4xl font-bold py-16 cursor-pointer border-4 ${
                selectedColor === color
                  ? `bg-${color.toLowerCase()}-600 border-white`
                  : `bg-${color.toLowerCase()}-500 border-transparent hover:scale-105`
              }`}
            >
              {color}
              {selectedColor === color && (
                <FiCheckCircle className="absolute top-3 right-3 text-white text-3xl animate-ping-once" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 italic text-white/90 text-center">
          {selectedColor
            ? `You selected: ${selectedColor}`
            : "Choose wisely..."}
          <div className="mt-1 text-sm text-white/90">
            System:{" "}
            {selectedColor ? "Waiting for opponent..." : "Round in progress"}
          </div>
        </div>

        <div className="flex gap-10">
          <button
            onClick={() => setShowSummary(true)}
            className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-md"
          >
            Summary
          </button>
          <button
            onClick={() => setShowSurrenderPopup(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-md"
          >
            Surrender
          </button>
        </div>
      </div>

      {showSurrenderPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="relative bg-black bg-opacity-20 backdrop-blur-md text-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold text-center mb-4">
              Are you sure you want to surrender?
            </h3>
            <div className="flex justify-around gap-6">
              <button
                onClick={() => {
                  abandonGame();
                  setShowSurrenderPopup(false);
                }}
                className="bg-gradient-to-r from-red-700 via-red-500 to-red-400 hover:opacity-90 text-white font-bold py-2 px-6 rounded-lg shadow transition-all"
              >
                Yes, Surrender
              </button>
              <button
                onClick={() => setShowSurrenderPopup(false)}
                className="bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 hover:opacity-90 text-white font-bold py-2 px-6 rounded-lg shadow transition-all"
              >
                No, Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {chatVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <ChatPopup
              currentRound={data.current_round}
              onClose={() => setChatVisible(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {showSummary && (
        <GameSummary
          player1Name={data.player1_name}
          player2Name={data.player2_name}
          rounds={data.rounds}
          onClose={() => setShowSummary(false)}
        />
      )}
    </div>
  );
};

export default Game;
