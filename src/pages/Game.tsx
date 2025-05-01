import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import LoadingPage from "./Loading";
import WaitingLobby from "./WaitingLobby";
import { API_URL, WS_URL } from "../config";
import GameTimer from "./components/GameTimer";
import { FaLock, FaMessage } from "react-icons/fa6";

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
              //navigate(`/summary/${id}?r=abandon`);
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
              //navigate(`/summary/${id}?r=finish`);
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
      //navigate(`/summary/${id}?r=abandon`);
      return;
    }
  };

  if (loading) return LoadingPage();
  if (error) return ErrorPage(error);
  if (data == null) return ErrorPage("Failed to fetch data!");

  console.log(data.rounds);

  if (data.player1_name == null || data.player2_name == null)
    return <WaitingLobby id={id!} game_code={data.code} />;

  return (
    <section className="flex flex-col md:flex-row gap-1 bg-neutral-800 items-start h-screen w-screen">
      <div className="flex flex-col items-center justify-center h-[80%] md:h-screen bg-neutral-800 text-white w-screen md:w-[80%]">
        {/* Header */}
        <div className="w-full p-4 bg-neutral-800 text-center text-xl font-bold">
          <div className="flex justify-between items-center">
            <div className="flex-1 pl-4">
              {localStorage.getItem("role") === "player1" ? (
                <div className="inline-flex items-center justify-center gap-2">
                  <span className="text-blue-400">{data!.player1_name}</span>
                  <span
                    className={
                      (data.player1_score < 0
                        ? "bg-red-400 "
                        : "bg-blue-400 ") +
                      "rounded-md px-2 py-1 text-white font-mono text-xs"
                    }
                  >
                    {data.player1_score > 0
                      ? "+" + data.player1_score
                      : data.player1_score}
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center justify-center gap-2">
                  <span className="text-blue-400">{data!.player2_name}</span>
                  <span
                    className={
                      (data.player2_score < 0
                        ? "bg-red-400 "
                        : "bg-blue-400 ") +
                      "rounded-md px-2 py-1 text-white font-mono text-xs"
                    }
                  >
                    {data.player2_score > 0
                      ? "+" + data.player2_score
                      : data.player2_score}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center">
              <div className="font-outfit">Round #{data!.current_round}</div>
              <GameTimer data={data} />
            </div>
            <div className="flex-1 pl-4">
              <div className="inline-flex items-center justify-center gap-2">
                {localStorage.getItem("role") === "player1" ? (
                  <>
                    <span className="text-blue-400">{data!.player2_name}</span>
                    <span
                      className={
                        (data.player2_score < 0
                          ? "bg-red-400 "
                          : "bg-blue-400 ") +
                        "rounded-md px-2 py-1 text-white font-mono text-xs"
                      }
                    >
                      {data.player2_score > 0
                        ? "+" + data.player2_score
                        : data.player2_score}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-blue-400">{data!.player1_name}</span>
                    <span
                      className={
                        (data.player1_score < 0
                          ? "bg-red-400 "
                          : "bg-blue-400 ") +
                        "rounded-md px-2 py-1 text-white font-mono text-xs"
                      }
                    >
                      {data.player1_score > 0
                        ? "+" + data.player1_score
                        : data.player1_score}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex w-[95%] h-full">
          <div
            className={`rounded-s-md flex-1 text-center text-white font-bold text-5xl flex items-center justify-center transition duration-300 cursor-pointer ${
              selectedColor === "RED" ? "bg-red-700" : "bg-red-500"
            }`}
            onClick={() => handleChoice("RED")}
          >
            RED
          </div>
          <div className="w-1 bg-neutral-800"></div>
          <div
            className={`rounded-e-md flex-1 text-center text-white font-bold text-5xl flex items-center justify-center transition duration-300 cursor-pointer ${
              selectedColor === "BLUE" ? "bg-blue-700" : "bg-blue-500"
            }`}
            onClick={() => handleChoice("BLUE")}
          >
            BLUE
          </div>
        </div>

        {/* Footer */}
        <div className="w-full p-4 bg-neutral-800 text-center text-lg font-thin">
          {selectedColor
            ? `You selected: ${selectedColor}! Waiting for the opponent...`
            : "Please choose a color"}
        </div>
      </div>

      {/* Sidebar */}
      <div className="rounded-t-lg md:rounded-tr-none md:rounded-tl-lgmd md:rounded-s-lg bg-stone-900 w-screen h-[20%] md:h-screen md:w-[20%] p-2 flex flex-col gap-1 justify-between">
        {/* Table of rounds */}
        <div className="overflow-y-auto custom-scrollbar text-white pt-4 rounded-t-md w-full h-[60%] bg-zinc-800 shadow-md overflow-hidden">
          <h2 className="text-center text-xl font-outfit font-bold mb-4">
            Rounds Summary
          </h2>
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-700">
                <th className="p-2">#</th>
                <th className="p-2">
                  {localStorage.getItem("role") === "player1"
                    ? "You"
                    : "Opponent"}
                </th>
                <th className="p-2">
                  {localStorage.getItem("role") === "player2"
                    ? "You"
                    : "Opponent"}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.rounds.map((round: any, index: number) => (
                <tr
                  key={index}
                  className="text-center odd:bg-[#222] even:bg-[#333]"
                >
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">
                    <div className="flex items-center justify-center gap-2 text-sm p-2 font-mono">
                      <div
                        className="w-6 h-6 rounded"
                        style={{
                          backgroundColor:
                            round.player1_choice === "RED"
                              ? "red"
                              : round.player1_choice === "BLUE"
                              ? "blue"
                              : "gray",
                        }}
                      >
                        {round.player1_score}
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center justify-center gap-2 text-sm p-2 font-mono">
                      <div
                        className="w-6 h-6 rounded"
                        style={{
                          backgroundColor:
                            round.player2_choice === "RED"
                              ? "red"
                              : round.player2_choice === "BLUE"
                              ? "blue"
                              : "gray",
                        }}
                      >
                        {round.player2_score}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <section className="flex flex-col gap-1 h-[40%]">
          <div className="bg-zinc-800 flex flex-col h-full justify-center items-center text-gray-400 p-5">
            <FaLock size="24" />
            <b>Chat with your opponent</b>
            <small>Locked until round 4.</small>
          </div>
          <button
            onClick={abandonGame}
            className="bg-red-500 text-white p-2 rounded-b-md w-full"
          >
            Surrender
          </button>
        </section>
      </div>
    </section>
  );
};

export default Game;
