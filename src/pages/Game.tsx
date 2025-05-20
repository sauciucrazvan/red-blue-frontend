// Game.tsx complet refactorizat cu timer centrat
import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import LoadingPage from "./Loading";
import ChatPopup from "./components/ChatPopup";
import GameSummary from "./components/GameSummary";
import { toastErrorWithSound } from "./components/toastWithSound";
import { AnimatePresence } from "framer-motion";
import { API_URL, WS_URL } from "../config";
import soundFile from "../assets/pop-up-notify-smooth-modern-332448.mp3";
import { FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";

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

export default function Game() {
  const { id } = useParams();
  const navigate = useNavigate();

  const prevRoundRef = useRef<number | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showSurrenderPopup, setShowSurrenderPopup] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(60);

  const playerName = useMemo(() => {
    return localStorage.getItem("role") === "player1"
      ? data?.player1_name
      : data?.player2_name;
  }, [data]);

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
          throw new Error(
            response.status === 404 ? "Game not found!" : response.statusText
          );
        }

        const gameData = await response.json();
        setData(gameData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id]);

  useEffect(() => {
    let ws: WebSocket;

    const initializeWebSocket = () => {
      ws = new WebSocket(`${WS_URL}ws/game/${id}`);

      ws.onmessage = (event) => {
        try {
          const wsData = JSON.parse(event.data);
          setInfoMsg(wsData.message);

          if (wsData.game_state === "finished") {
            navigate(
              `/game/summary/${id}?r=${
                wsData.message.includes("abandoned") ? "abandon" : "finish"
              }`
            );
          }

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
        } catch (error) {
          console.error("WebSocket message parsing error:", error);
        }
      };
    };

    initializeWebSocket();
    //return () => ws?.close();
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
    if (!data) return;

    setLoading(true);

    if (
      !data.player1_name ||
      !data.player2_name ||
      data.game_state === "waiting"
    ) {
      navigate(`/game/lobby/${id}`);
    } else setLoading(false);
  }, [data, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (data?.game_state === "waiting" || data?.game_state === "pause")
        return;

      const round = data?.rounds?.[data?.current_round - 1];
      if (!round?.created_at) return;

      const elapsed = Math.floor(
        (Date.now() - new Date(round.created_at).getTime()) / 1000
      );
      setTimer(Math.max(60 - elapsed, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

  const handleChoice = (color: string) => {
    if (selectedColor) {
      toastErrorWithSound("Wait for your opponent!");
      return;
    }
    setSelectedColor(color);
    chooseColor(color);
  };

  const chooseColor = async (choice: string) => {
    if (data == null) return;

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
      toast.error(`Failed to submit choice: ${error.message}`);

      if (error.message.includes("finished")) {
        navigate(`/game/summary/${id}?r=finish`);
      }
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
      navigate(`/game/summary/${id}?r=abandon`);
    }
  };

  if (loading) return LoadingPage();
  if (error) return ErrorPage(error);
  if (!data) return ErrorPage("Failed to fetch data!");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-red-700 to-blue-700 text-white overflow-y-auto px-4 sm:px-10 py-4">
      <div className="bg-black/20 backdrop-blur-md border border-black/20 p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-full md:max-w-5xl flex flex-col items-center relative gap-6 sm:gap-8">
        {/* Round Indicator */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">
          Round {data.current_round}
        </h2>

        {/* Player Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 w-full px-4 sm:px-10">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl text-center shadow-md w-full md:max-w-xs">
            <div
              className={`text-lg font-semibold ${
                playerName === data.player1_name
                  ? "text-yellow-400"
                  : "text-white"
              }`}
            >
              {data.player1_name}
            </div>
            <div
              className={`text-2xl sm:text-3xl font-bold ${
                data.player1_score > 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {data.player1_score} pts
            </div>
          </div>

          {/* Timer */}
          <div className="flex justify-center">
            <div className="relative w-40 h-40 sm:w-40 sm:h-40">
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
              <div className="absolute inset-0 flex items-center justify-center text-3xl sm:text-5xl font-bold text-white">
                {timer}
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl text-center shadow-md w-full md:max-w-xs">
            <div
              className={`text-lg font-semibold ${
                playerName === data.player2_name
                  ? "text-yellow-400"
                  : "text-white"
              }`}
            >
              {data.player2_name}
            </div>
            <div
              className={`text-2xl sm:text-3xl font-bold ${
                data.player2_score > 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {data.player2_score} pts
            </div>
          </div>
        </div>

        {/* Color Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6 px-4 sm:px-10">
          {["RED", "BLUE"].map((color) => (
            <div
              key={color}
              onClick={() => handleChoice(color)}
              className={`relative transition-all duration-300 rounded-xl text-center text-2xl sm:text-4xl font-bold py-12 sm:py-16 cursor-pointer border-4 
              ${
                selectedColor === color
                  ? `bg-${color.toLowerCase()}-600 border-white`
                  : `bg-${color.toLowerCase()}-500 border-transparent hover:scale-105`
              }
            `}
            >
              {color}
              {selectedColor === color && (
                <FiCheckCircle className="absolute top-3 right-3 text-white text-3xl animate-ping-once" />
              )}
            </div>
          ))}
        </div>

        {/* Info & System Messages */}
        <div className="mt-6 text-center text-white/90">
          <div className="text-white font-bold">{infoMsg}</div>
          <div className="text-lg">
            {selectedColor
              ? `You selected: ${selectedColor}`
              : "Choose wisely..."}
          </div>
          <div className="mt-1 text-sm">
            {selectedColor ? "Waiting for opponent..." : "Round in progress"}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 mt-6">
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

      {/* Surrender Popup */}
      {showSurrenderPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="relative bg-black bg-opacity-20 backdrop-blur-md text-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold text-center mb-4">
              Are you sure you want to surrender?
            </h3>
            <div className="flex flex-col sm:flex-row justify-around gap-6">
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

      {/* Chat Popup */}
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

      {/* Game Summary Popup */}
      <AnimatePresence>
        {showSummary && (
          <GameSummary
            player1Name={data.player1_name}
            player2Name={data.player2_name}
            rounds={data.rounds}
            onClose={() => setShowSummary(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
