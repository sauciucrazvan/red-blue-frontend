import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ErrorPage from "./ErrorPage";
import LoadingPage from "./Loading";
import WaitingLobby from "./WaitingLobby";
import ChatPopup from "./components/ChatPopup";
import { API_URL, WS_URL } from "../config";
import GameTimer from "./components/GameTimer";
import GameSummary from "./components/GameSummary";

const Game = () => {
  let { id } = useParams();
  const navigate = useNavigate();

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showSurrenderPopup, setShowSurrenderPopup] = useState(false);

  const handleChoice = (color: string) => {
    if (selectedColor) {
      toast("Wait for your opponent");
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
        if (!token) {
          setError("Invalid token.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}api/v1/game/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status == 404) {
            navigate("/404");
            return;
          }

          setError(response.statusText.toString());
          setLoading(false);
          throw new Error(`Error: ${response.statusText}`);
        }

        if (!localStorage.getItem("role")) {
          setError("Player role is not defined!");
          setLoading(false);
          throw new Error(`Player role is not defined`);
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
  }, [id]);

  useEffect(() => {
    let ws: WebSocket;

    const initializeWebSocket = () => {
      try {
        ws = new WebSocket(`${WS_URL}ws/game/${id}`);

        ws.onopen = () => {
          console.log("WebSocket connection established");
        };

        ws.onmessage = (event) => {
          try {
            const wsData = JSON.parse(event.data);

            if (!wsData.game_state && wsData.game_state === "finished") {
              navigate(`/summary/${id}?r=abandon`);
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

            if (wsData.game_state === "finished") {
              navigate(`/summary/${id}?r=finish`);
            }
          } catch (err) {
            console.error("Failed to parse WebSocket message:", err);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          setError("Failed to connect to WebSocket");
        };

        ws.onclose = () => {
          console.log("WebSocket connection closed");
        };
      } catch (err) {
        console.error("WebSocket initialization error:", err);
        setError("Failed to initialize WebSocket");
      }
    };

    initializeWebSocket();
  }, [id]);

  const chooseColor = async (choice: string) => {
    try {
      const response = await fetch(
        `${API_URL}api/v1/game/${id}/round/${data?.current_round || 1}/choice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            game_id: id,
            round_number: data?.current_round || 1,
            player_name: playerName,
            choice: choice,
            token: localStorage.getItem("token"),
          }),
        }
      );

      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(`Error: ${errorDetail.detail || response.statusText}`);
      }

      const response_data = await response.json();
      console.log(response_data.message);
    } catch (error: any) {
      console.error("Error choosing color:", error.message);
      setError(`Failed to submit choice: ${error.message}`);
    }
  };

  const abandonGame = async () => {
    try {
      await fetch(`${API_URL}api/v1/game/${id}/abandon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
  if (data == null) return ErrorPage("Failed to fetch data!");
  if (data.player1_name == null || data.player2_name == null)
    return (
      <WaitingLobby
        id={id!}
        game_code={data.code}
        created_at={data.created_at}
      />
    );

  return (
    <section className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-br from-red-700 via-purple-300 to-blue-700 text-white overflow-y-auto px-4 py-4">
      {/* Transparent box */}
      <div className="w-full max-w-3xl bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-xl p-6 flex flex-col items-center space-y-6">
        {/* Top bar with buttons */}
        <div className="w-full flex justify-between items-center space-x-4">
          <button
            onClick={() => setShowSummary(true)}
            className="bg-gradient-to-r from-red-700 via-purple-300 to-blue-700 hover:opacity-90 text-white font-bold py-2 px-6 rounded-lg shadow transition-all w-1/3"
          >
            View Game Summary
          </button>
          <button
            onClick={() => setChatVisible(true)}
            className="bg-gradient-to-r from-red-700 via-purple-300 to-blue-700 hover:opacity-90 text-white font-bold py-2 px-6 rounded-lg shadow transition-all w-1/3"
          >
            Open Chat
          </button>
          <button
            onClick={() => setShowSurrenderPopup(true)}
            className="bg-gradient-to-r from-red-700 via-purple-300 to-blue-700 hover:opacity-90 text-white font-bold py-2 px-6 rounded-lg shadow transition-all w-1/3"
          >
            Surrender
          </button>
        </div>

        {/* Header Info */}
        <div className="text-center font-semibold text-lg w-full flex justify-around items-center bg-black/10 p-4 rounded-lg">
          <div>
            {localStorage.getItem("role") === "player1"
              ? `${data.player1_name} (${data.player1_score})`
              : `${data.player2_name} (${data.player2_score})`}
          </div>
          <div>
            Round {data.current_round}
            <GameTimer data={data} />
          </div>
          <div>
            {localStorage.getItem("role") === "player1"
              ? `${data.player2_name} (${data.player2_score})`
              : `${data.player1_name} (${data.player1_score})`}
          </div>
        </div>

        {/* Choices */}
        <div className="grid grid-cols-2 gap-6 w-full">
          <div
            className={`text-center font-bold text-4xl py-16 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 ${
              selectedColor === "RED" ? "bg-red-700" : "bg-red-500"
            }`}
            onClick={() => handleChoice("RED")}
          >
            RED
          </div>
          <div
            className={`text-center font-bold text-4xl py-16 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 ${
              selectedColor === "BLUE" ? "bg-blue-700" : "bg-blue-500"
            }`}
            onClick={() => handleChoice("BLUE")}
          >
            BLUE
          </div>
        </div>

        {/* Status Text */}
        <div className="text-white font-semibold text-lg">
          {selectedColor ? "Waiting for your opponent..." : "Choose a color!"}
        </div>
      </div>

      {/* Surrender Confirmation Popup */}
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

      {/* Chat Popup */}
      {chatVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="relative bg-black bg-opacity-20 backdrop-blur-md text-white p-6 rounded shadow-lg w-full max-w-md">
            <ChatPopup
              currentRound={data.current_round}
              onClose={() => setChatVisible(false)}
            />
          </div>
        </div>
      )}

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
};

export default Game;
