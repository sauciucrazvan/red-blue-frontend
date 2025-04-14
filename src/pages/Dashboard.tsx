import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

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
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-red-400 via-purple-200 to-blue-400 text-gray-800 p-4">
      <h1 className="text-6xl font-extrabold text-center mt-6 mb-4">
        <span className="text-red-600">RED</span>
        <span className="text-purple-700">_</span>
        <span className="text-blue-600">BLUE</span>
      </h1>

      <div className="w-full max-w-md mt-6 flex flex-col items-center">
        <input
          type="text"
          className="w-full border border-gray-400 rounded p-2 text-center mb-4"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
          <div className="w-full max-w-xs h-60 border border-white bg-white bg-opacity-10 backdrop-blur-md rounded p-6 shadow-md flex flex-col justify-center items-center text-center">
            <h2 className="text-xl font-bold mb-4">Create a Game</h2>
            <button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded"
              onClick={createGame}
            >
              Create Game
            </button>
          </div>

          <div className="w-full max-w-xs h-60 border border-white bg-white bg-opacity-10 backdrop-blur-md rounded p-6 shadow-md flex flex-col justify-center items-center text-center">
            <h2 className="text-xl font-bold mb-2">Join a Game</h2>
            <input
              type="text"
              className="w-full border border-gray-400 rounded p-2 text-center mb-2"
              placeholder="Game code"
              value={joinGameCode}
              onChange={(e) => setJoinGameCode(e.target.value)}
            />
            <button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded"
              onClick={joinGame}
            >
              Join Game
            </button>
          </div>
        </div>

        {error && <div className="mt-4 text-red-600 font-semibold">Error: {error}</div>}

        <div className="mt-10 w-full max-w-2xl border border-white bg-white bg-opacity-10 backdrop-blur-md p-6 rounded shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">How to Play</h2>
          <p className="mb-2">
            Once a game starts, the two users will play a total of <strong>10 rounds</strong>.
            In each round, they choose between two colors: <span className="text-red-600 font-bold">RED</span> or <span className="text-blue-600 font-bold">BLUE</span>.
          </p>
          <table className="w-full text-center mb-4 border border-gray-400">
            <thead>
              <tr className="bg-gray-300">
                <th>Player 1</th>
                <th>Player 2</th>
                <th>Player 1 Score</th>
                <th>Player 2 Score</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>RED</td>
                <td>RED</td>
                <td>+3</td>
                <td>+3</td>
              </tr>
              <tr className="bg-gray-100">
                <td>RED</td>
                <td>BLUE</td>
                <td>-6</td>
                <td>+6</td>
              </tr>
              <tr>
                <td>BLUE</td>
                <td>RED</td>
                <td>+6</td>
                <td>-6</td>
              </tr>
              <tr className="bg-gray-100">
                <td>BLUE</td>
                <td>BLUE</td>
                <td>-3</td>
                <td>-3</td>
              </tr>
            </tbody>
          </table>
          <p className="mb-2">
            During the game, players can see their score for each past round (e.g. +3, -6, etc.) as well as their total score.
          </p>
          <p className="mb-2">
            <strong>Rounds 9 and 10</strong> have <strong>doubled score</strong> values.
          </p>
          <p>
            <strong>WINNING CONDITION:</strong> A player with a positive score at the end is considered a <span className="text-green-600 font-bold">winner</span>. A player with a negative or null score has <span className="text-red-600 font-bold">lost</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
