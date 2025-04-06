import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  let navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [joinGameCode, setJoinGameCode] = useState("");

  const createGame = async () => {
    if (playerName.length < 3 || playerName.length > 16) {
      setError("Player name must be between 3 and 16 characters.");
      return;
    }

    try {
      setError(null);
      const response = await fetch("http://localhost:8000/api/v1/game/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ player1_name: playerName }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      await localStorage.setItem("role", data.role);

      navigate(`/game/${data.game_id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const joinGame = async () => {
    if (playerName.length < 3 || playerName.length > 16) {
      setError("Player name must be between 3 and 16 characters.");
      return;
    }
    if (!joinGameCode) {
      setError("Game code is required to join a game.");
      return;
    }

    try {
      setError(null);
      const response = await fetch("http://localhost:8000/api/v1/game/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ player_name: playerName, code: joinGameCode }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      await localStorage.setItem("role", data.role);
      navigate(`/game/${data.game_id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <section className="flex flex-col justify-center items-center h-full">
        <div className="flex flex-row">
          <h1 className="text-red-500">RED</h1>
          <h1 className="text-purple-500">_</h1>
          <h1 className="text-blue-500">BLUE</h1>
        </div>
        <div className="pt-4">Choose a name</div>
        <input
          type="text"
          className="border p-2 mr-2"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />

        <section className="flex flex-row pt-4">
          <div className="flex flex-col items-center justify-center gap-2 bg-gray-300 p-6 rounded-l-md">
            <h1>Create a game</h1>
            <button className="bg-green-500 p-2" onClick={createGame}>
              Create game
            </button>
          </div>

          <div className="flex flex-col justify-center items-center h-full gap-2 bg-gray-400 p-6 rounded-r-md">
            <h1>Join a game</h1>
            <div>
              <input
                type="text"
                className="border p-2 mr-2"
                placeholder="Game code"
                value={joinGameCode}
                onChange={(e) => setJoinGameCode(e.target.value)}
              />
              <button className="bg-green-500 p-2" onClick={joinGame}>
                Join game
              </button>
            </div>
          </div>
        </section>
        {error && <div className="mt-4 text-red-500">Error: {error}</div>}
      </section>
    </>
  );
}
