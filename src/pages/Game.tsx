import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import LoadingPage from "./Loading";
import WaitingLobby from "./WaitingLobby";
import ChatPopup from "./ChatPopup";
import { API_URL, WS_URL } from "../config";
import GameTimer from "./components/GameTimer";


const Game = () => {
  let { id } = useParams();
  const navigate = useNavigate();

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);

  const handleChoice = (color: string) => {
    if (selectedColor) return;

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
          localStorage.getItem("role") == "player1"
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
              console.log("Player abandoned, navigating to summary...");
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
              return;
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
    return;
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
      const response = await fetch(`${API_URL}api/v1/game/${id}/abandon`, {
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

      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(`Error: ${errorDetail.detail || response.statusText}`);
      }

      const response_data = await response.json();
      console.log(response_data.message);
    } catch (error: any) {
      console.error("Error abandoning the game:", error.message);
      setError(`Failed to submit choice: ${error.message}`);
    } finally {
      navigate(`/summary/${id}?r=abandon`);
      return;
    }
  };

  if (loading) return LoadingPage();
  if (error) return ErrorPage(error);
  if (data == null) return ErrorPage("Failed to fetch data!");

  if (data.player1_name == null || data.player2_name == null)
    return <WaitingLobby id={id!} game_code={data.code} />;

  return (
    <section className="grid grid-cols-1 md:grid-cols-5 h-screen w-screen bg-gradient-to-br from-red-700 via-purple-300 to-blue-700 text-gray-100">
      {/* Sidebar */}
      <aside className="col-span-1 bg-black/80 backdrop-blur-md p-4 flex flex-col gap-6 shadow-lg border-r border-white/10">
        <div className="text-center text-2xl font-bold">Dashboard</div>

        <button
          onClick={abandonGame}
          className="bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 text-white py-2 rounded-lg font-semibold shadow-md"
        >
          Surrender
        </button>

        {/* Rounds Summary */}
        <div className="bg-white/10 p-4 rounded-lg">
          <h2 className="text-center text-lg font-bold mb-2">Rounds Summary</h2>
          <table className="w-full text-sm text-white">
            <thead>
              <tr className="bg-white/10">
                <th className="py-1">#</th>
                <th className="py-1">{localStorage.getItem("role") === "player1" ? "You" : "Opponent"}</th>
                <th className="py-1">{localStorage.getItem("role") === "player2" ? "You" : "Opponent"}</th>
              </tr>
            </thead>
            <tbody>
              {data.rounds.map((round: any, index: number) => (
                <tr key={index} className="text-center hover:bg-white/5">
                  <td className="py-1">{index + 1}</td>
                  <td className="py-1">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: round.player1_choice === "RED" ? "red" : round.player1_choice === "BLUE" ? "blue" : "gray" }} />
                      <span className="text-xs">({round.player1_score})</span>
                    </div>
                  </td>
                  <td className="py-1">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: round.player2_choice === "RED" ? "red" : round.player2_choice === "BLUE" ? "blue" : "gray" }} />
                      <span className="text-xs">({round.player2_score})</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </aside>

      {/* Main Game Area */}
      <main className="col-span-4 flex flex-col items-center justify-start p-6 gap-6 overflow-y-auto">
        {/* Header */}
        <div className="w-full bg-white/10 p-4 rounded-lg shadow flex justify-between items-center text-center font-semibold text-lg">
          <div className="w-1/3 text-left">
            {localStorage.getItem("role") === "player1"
              ? `${data.player1_name} (${data.player1_score})`
              : `${data.player2_name} (${data.player2_score})`}
          </div>
          <div className="w-1/3">
            Round {data.current_round}
            <GameTimer data={data} />
          </div>
          <div className="w-1/3 text-right">
            {localStorage.getItem("role") === "player1"
              ? `${data.player2_name} (${data.player2_score})`
              : `${data.player1_name} (${data.player1_score})`}
          </div>
        </div>

        {/* Choices */}
        <div className="grid grid-cols-2 w-full gap-4">
          <div
            className={`text-center font-bold text-4xl py-20 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 ${
              selectedColor === "RED" ? "bg-red-700" : "bg-red-500"
            }`}
            onClick={() => handleChoice("RED")}
          >
            RED
          </div>
          <div
            className={`text-center font-bold text-4xl py-20 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 ${
              selectedColor === "BLUE" ? "bg-blue-700" : "bg-blue-500"
            }`}
            onClick={() => handleChoice("BLUE")}
          >
            BLUE
          </div>
        </div>

        {/* Selection Info */}
        <div className="w-full text-center bg-white/10 py-3 rounded-lg font-medium">
          {selectedColor
            ? `You selected: ${selectedColor}. Waiting for the opponent...`
            : "Please choose a color"}
        </div>
      </main>

      <div className="fixed bottom-36 left-1/3 -translate-x-1/2">
      <h1 className="relative text-6xl font-extrabold text-center mt-6 mb-4">
          <span className="relative z-10 text-neutral-200">Red</span>
          <span className="absolute left-1/4 -translate-x-1/2 top-1/2 -translate-y-1/2 w-28 h-28 bg-red-600 rounded-full z-0 opacity-90"></span>

          <span className="relative z-10 text-neutral-200">Blue</span>
          <span className="absolute left-3/4 -translate-x-1/2 top-1/2 -translate-y-1/2 w-28 h-28 bg-blue-600 rounded-full z-0 opacity-90"></span>
        </h1>
      </div>
      {/* Chat Popup */}
      <div className="fixed bottom-4 right-4">
        <ChatPopup currentRound={data.current_round} />
      </div>
    </section>
  );
};

export default Game;
