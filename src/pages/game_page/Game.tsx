import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import soundFile from "../../assets/pop-up-notify-smooth-modern-332448.mp3";
import { FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import { API_URL, WS_URL } from "../../config";
import GameSummary from "../../components/GameSummary";
import { toastErrorWithSound } from "../../components/toastWithSound";
import ErrorPage from "../system_pages/ErrorPage";
import LoadingPage from "../system_pages/Loading";
import GameTimer from "./components/game_timer";
import PlayerCard from "./components/player_card";
import AnimatedDots from "../../components/AnimatedDots";
import ChatPopup from "./components/chat_popup";

const roundStartSound = new Audio(soundFile);

export default function Game() {
  const { id } = useParams();
  const navigate = useNavigate();

  const prevRoundRef = useRef<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showSurrenderPopup, setShowSurrenderPopup] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showChatRequest, setShowChatRequest] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [myChatAnswer, setMyChatAnswer] = useState<"yes" | "no" | null>(null);
  const [opponentChatAnswer, setOpponentChatAnswer] = useState<
    "yes" | "no" | null
  >(null);

  const playerName = useMemo(() => {
    return localStorage.getItem("role") === "player1"
      ? data?.player1_name
      : data?.player2_name;
  }, [data]);

  // Fetch game data
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

  // WebSocket connection and message handling
  useEffect(() => {
    let ws: WebSocket;

    const initializeWebSocket = () => {
      ws = new WebSocket(`${WS_URL}ws/game/${id}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const wsData = JSON.parse(event.data);
          if (wsData.message) setInfoMsg(wsData.message);

          if (wsData.game_state === "finished") {
            navigate(
              `/game/summary/${id}?r=${
                wsData.message?.includes("abandoned") ? "abandon" : "finish"
              }`
            );
          }

          if (wsData.type === "disconnect_event") {
            setInfoMsg(wsData.player_name + " disconnected.");
            navigate(`/game/lobby/${id}`);
            return;
          }

          // --- Chat logic ---
          if (wsData.type !== "chat-message" && wsData.message) {
            setInfoMsg(wsData.message);
          }

          if (wsData.type === "chat-request") {
            setShowChatRequest(true);
          }
          if (wsData.type === "chat-agree") {
            setOpponentChatAnswer("yes");
          }
          if (wsData.type === "chat-decline") {
            setOpponentChatAnswer("no");
            setShowChatRequest(false);
            setChatOpen(false);
            setInfoMsg("A player declined the chat request.");
          }
          if (wsData.type === "chat-close") {
            setChatOpen(false);
            setMyChatAnswer(null);
            setOpponentChatAnswer(null);
            setInfoMsg("A player closed the chat.");
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

            // Reset chat state on round change
            setShowChatRequest(false);
            setChatOpen(false);
            setMyChatAnswer(null);
            setOpponentChatAnswer(null);
          }
        } catch (error) {
          console.error("WebSocket message parsing error:", error);
        }
      };
    };

    initializeWebSocket();

    // CLEANUP: close socket on unmount or id change
    // return () => {
    //   wsRef.current?.close();
    //   wsRef.current = null;
    // };
  }, [id, navigate]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      //event.preventDefault(); stupid dialog, burn in hell!
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "disconnect_event",
            player_name: playerName,
            token: localStorage.getItem("token"),
          })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [playerName]);

  // Open chat only if both say yes, close if at least one says no or close the chat
  useEffect(() => {
    if (myChatAnswer === "yes" && opponentChatAnswer === "yes") {
      setShowChatRequest(false);
      setChatOpen(true);
    }
    if (
      myChatAnswer === "no" ||
      opponentChatAnswer === "no" ||
      (myChatAnswer === null && opponentChatAnswer === null && !chatOpen)
    ) {
      setShowChatRequest(false);
      setChatOpen(false);
    }
  }, [myChatAnswer, opponentChatAnswer, chatOpen]);

  // Reset chat state and send chat request on new chat round
  useEffect(() => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    if (data?.current_round === 4 || data?.current_round === 8) {
      wsRef.current?.send(JSON.stringify({ type: "chat-request" }));
      setShowChatRequest(true);
      setMyChatAnswer(null);
      setOpponentChatAnswer(null);
      setChatOpen(false);
    }
  }, [data?.current_round]);

  // Play sound on round change
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

  // Redirect to lobby if game not ready
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
          {playerName === data.player1_name ? (
            <PlayerCard player={data.player1_name} score={data.player1_score} />
          ) : (
            <PlayerCard player={data.player2_name} score={data.player2_score} />
          )}

          <GameTimer
            created_at={data?.rounds?.[data?.current_round - 1]?.created_at}
            onHold={data.game_state === "waiting" || !data.current_round}
          />

          {playerName === data.player1_name ? (
            <PlayerCard player={data.player2_name} score={data.player2_score} />
          ) : (
            <PlayerCard player={data.player1_name} score={data.player1_score} />
          )}
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
          <div className="mt-1 text-md">
            {selectedColor ? "Waiting for opponent" : "Round in progress"}
            <AnimatedDots />
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
      <AnimatePresence>
        {showSurrenderPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: -50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{
                scale: 0.8,
                opacity: 0,
                y: 50,
                transition: { duration: 0.5 },
              }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              className="bg-black bg-opacity-20 backdrop-blur-md rounded p-6 text-white shadow-lg w-full max-w-sm"
            >
              <h3 className="text-xl font-bold text-center mb-4">
                Are you sure you want to surrender?
              </h3>
              <div className="flex flex-col sm:flex-row justify-around gap-6">
                <button
                  onClick={() => {
                    abandonGame();
                    setShowSurrenderPopup(false);
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-gray-800 font-semibold py-2 px-4 rounded"
                >
                  Yes, Surrender
                </button>
                <button
                  onClick={() => setShowSurrenderPopup(false)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                >
                  No, Go Back
                </button>
              </div>
            </motion.div>
          </motion.div>
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

      {/* Chat Popup - Request to Open Chat */}
      <AnimatePresence>
        {showChatRequest && !chatOpen && myChatAnswer === null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: -50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{
                scale: 0.8,
                opacity: 0,
                y: 50,
                transition: { duration: 0.5 },
              }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              className="bg-black bg-opacity-20 backdrop-blur-md rounded p-6 text-white shadow-lg w-full max-w-sm"
            >
              <h2 className="text-xl font-bold mb-4 flex justify-around gap-6">
                Do you want to chat?
              </h2>
              <div className="flex justify-around gap-6">
                <button
                  className="bg-gray-400 hover:bg-gray-500 text-gray-800 font-semibold py-2 px-4 rounded"
                  onClick={() => {
                    setShowChatRequest(false);
                    setMyChatAnswer("no");
                    if (
                      wsRef.current &&
                      wsRef.current.readyState === WebSocket.OPEN
                    ) {
                      wsRef.current.send(
                        JSON.stringify({
                          type: "chat-decline",
                          player_name: playerName,
                        })
                      );
                    }
                  }}
                >
                  No, I don't
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                  onClick={() => {
                    setMyChatAnswer("yes");
                    if (
                      wsRef.current &&
                      wsRef.current.readyState === WebSocket.OPEN
                    ) {
                      wsRef.current.send(
                        JSON.stringify({
                          type: "chat-agree",
                          player_name: playerName,
                        })
                      );
                    }
                  }}
                >
                  Yes, I do
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Popup - Active Chat Window */}
      <AnimatePresence>
        {chatOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <ChatPopup
              currentRound={data?.current_round}
              onClose={() => {
                setChatOpen(false);
                setMyChatAnswer(null);
                setOpponentChatAnswer(null);
                if (
                  wsRef.current &&
                  wsRef.current.readyState === WebSocket.OPEN
                ) {
                  wsRef.current.send(JSON.stringify({ type: "chat-close" }));
                }
              }}
              socket={wsRef.current!}
              myRole={localStorage.getItem("role")!}
              player1Name={data.player1_name}
              player2Name={data.player2_name}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
