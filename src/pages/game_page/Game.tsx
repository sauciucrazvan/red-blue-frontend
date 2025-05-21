import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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

const roundStartSound = new Audio(soundFile);

export default function Game() {
  const { id } = useParams();
  const navigate = useNavigate();

  const prevRoundRef = useRef<number | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showSurrenderPopup, setShowSurrenderPopup] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  //const [chatPromptVisible, setChatPromptVisible] = useState(false);
  // const [chatIntent, setChatIntentState] = useState<{
  //   [round: number]: { self: boolean; opponent: boolean };
  // }>({});
  //const [chatOpen, setChatOpen] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const playerName = useMemo(() => {
    return localStorage.getItem("role") === "player1"
      ? data?.player1_name
      : data?.player2_name;
  }, [data]);

  // const updateChatIntent = (
  //   round: number,
  //   who: "self" | "opponent",
  //   value: boolean
  // ) => {
  //   setChatIntentState((prev) => ({
  //     ...prev,
  //     [round]: {
  //       ...prev[round],
  //       [who]: value,
  //     },
  //   }));
  // };

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
      try {
        ws = new WebSocket(`${WS_URL}ws/game/${id}`);
        wsRef.current = ws;

        ws.onmessage = (event) => {
          try {
            const wsData = JSON.parse(event.data);
            console.log("Received from WebSocket:", wsData);

            if (wsData.message) {
              setInfoMsg(wsData.message);
            }

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
              setInfoMsg(`Round ${wsData.next_round} has started.`);
            }

            // if (
            //   wsData.type === "chat-intent" &&
            //   wsData.round === data?.current_round
            // ) {
            //   if (wsData.player_name !== playerName) {
            //     updateChatIntent(wsData.round, "opponent", wsData.accept);

            //     if (wsData.accept) {
            //       setInfoMsg("Your opponent accepted the chat invitation.");
            //     } else {
            //       setInfoMsg("Your opponent declined the chat invitation.");
            //     }
            //   }
            // }

            // if (wsData.type === "chat-close") {
            //   setChatOpen(false);
            //   setInfoMsg("The chat was closed by your opponent.");
            // }
          } catch (err) {
            console.error("Failed to parse WebSocket message:", err);
            setInfoMsg("Error while receiving a WebSocket message.");
          }
        };
      } catch (err) {
        console.error("WebSocket initialization error:", err);
        setInfoMsg("WebSocket connection failed to initialize.");
      }
    };

    initializeWebSocket();
  }, [id, navigate, data?.current_round, playerName]);

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

  const handleChoice = (color: string) => {
    if (selectedColor) {
      toastErrorWithSound("Wait for your opponent!");
      return;
    }
    setSelectedColor(color);
    chooseColor(color);
  };

  // useEffect(() => {
  //   if (data?.current_round === 4 || data?.current_round === 8) {
  //     setChatPromptVisible(true);
  //   }
  // }, [data?.current_round]);

  // const setChatIntent = (accept: boolean) => {
  //   updateChatIntent(data?.current_round, "self", accept);

  //   wsRef.current?.send(
  //     JSON.stringify({
  //       type: "chat-intent",
  //       round: data?.current_round,
  //       player_name: playerName,
  //       accept,
  //     })
  //   );
  // };

  // useEffect(() => {
  //   const round = data?.current_round;
  //   if (!round) return;
  //   const intent = chatIntent[round];
  //   if (intent?.self && intent?.opponent) {
  //     setChatOpen(true);
  //   }
  // }, [chatIntent, data?.current_round]);

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

      if (error.message.includes("not active")) {
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
          </div>
        </div>
      )}

      {/* Chat Prompt */}
      {/* {chatPromptVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-black bg-opacity-20 backdrop-blur-md rounded p-6 text-white shadow-lg w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 flex justify-around gap-6">
              Do you want to chat?
            </h2>
            <div className="flex justify-around gap-6">
              <button
                onClick={() => {
                  setChatIntent(false);
                  setChatPromptVisible(false);
                }}
                className="bg-gray-400 hover:bg-gray-500 text-gray-800 font-semibold py-2 px-4 rounded"
              >
                No, I don't
              </button>
              <button
                onClick={() => {
                  setChatIntent(true);
                  setChatPromptVisible(false);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
              >
                Yes, I do
              </button>
            </div>
          </div>
        </div>
      )} */}

      {/* Chat Popup */}
      {/* <AnimatePresence>
        {chatOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <ChatPopup
              currentRound={data.current_round}
              socket={wsRef.current!}
              onClose={() => {
                wsRef.current?.send(
                  JSON.stringify({
                    type: "chat-close",
                    round: data?.current_round,
                  })
                );
                setChatOpen(false);
                setChatIntent(false);
                setChatPromptVisible(false);
              }}
            />
          </div>
        )}
      </AnimatePresence> */}

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
