import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import WaitingLobby from "./WaitingLobby";
import ErrorPage from "./ErrorPage";
import LoadingPage from "./Loading";

const Game = () => {
  let { id } = useParams();
  const navigate = useNavigate();

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
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
        const response = await fetch(
          `http://localhost:8000/api/v1/game/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

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
          throw new Error(`Error: Player role is not defined`);
        }

        const data = await response.json();

        setRole(localStorage.getItem("role"));
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
        ws = new WebSocket(`ws://localhost:8000/ws/game/${id}`);

        ws.onopen = () => {
          console.log("WebSocket connection established");
        };

        ws.onmessage = (event) => {
          try {
            const wsData = JSON.parse(event.data);
            //console.log("WebSocket data received:", wsData);

            // DEBUG STUFF
            // if (wsData.message) {
            //   console.log(wsData.message);
            // }
            // if (wsData.player1_choice) {
            //   console.log("Player 1 chose:", wsData.player1_choice);
            // }
            // if (wsData.player2_choice) {
            //   console.log("Player 2 chose:", wsData.player2_choice);
            // }

            if (wsData.next_round) {
              setData((prev: any) => ({
                ...prev,
                current_round: wsData.next_round,
                player1_score: wsData.player1_score,
                player2_score: wsData.player2_score,
              }));

              setSelectedColor(null);
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
    // console.log("Sending POST request:", {
    //   game_id: id,
    //   round_number: data?.current_round || 0,
    //   player_name: playerName,
    //   choice: choice,
    // });

    try {
      const response = await fetch(
        `http://localhost:8000/game/${id}/round/${
          data?.current_round || 1
        }/choice`,
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

  if (loading) return LoadingPage();
  if (error) return ErrorPage(error);
  if (data == null) return ErrorPage("Failed to fetch data!");

  if (data.player1_name == null || data.player2_name == null)
    return WaitingLobby(data!.code);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="w-full p-4 bg-gray-700 text-center text-xl font-bold">
        <div className="flex justify-between">
          <div className="flex-1 pl-4">
            {data!.player1_name} ({data.player1_score})
          </div>
          <div>Round: {data!.current_round}</div>
          <div className="flex-1 pl-4">
            {data!.player2_name} ({data.player2_score})
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex w-full h-full">
        <div
          className={`flex-1 text-center text-white font-bold text-5xl flex items-center justify-center transition duration-300 cursor-pointer ${
            selectedColor === "RED" ? "bg-red-700" : "bg-red-500"
          }`}
          onClick={() => handleChoice("RED")}
        >
          RED
        </div>
        <div className="w-1 bg-black"></div>
        <div
          className={`flex-1 text-center text-white font-bold text-5xl flex items-center justify-center transition duration-300 cursor-pointer ${
            selectedColor === "BLUE" ? "bg-blue-700" : "bg-blue-500"
          }`}
          onClick={() => handleChoice("BLUE")}
        >
          BLUE
        </div>
      </div>

      {/* Footer */}
      <div className="w-full p-4 bg-gray-700 text-center text-lg">
        {selectedColor
          ? `You selected: ${selectedColor}! Waiting for the opponent...`
          : "Please choose a color"}
      </div>
    </div>
  );
};

export default Game;
