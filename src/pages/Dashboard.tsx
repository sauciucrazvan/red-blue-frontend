import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { FaArrowRight } from "react-icons/fa6";
import { CgArrowLongRight } from "react-icons/cg";

export default function Dashboard() {
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [joinGameCode, setJoinGameCode] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const createGame = async () => {
    if (playerName.length < 3 || playerName.length > 16) {
      setError("Player name must be between 3 and 16 characters.");
      return;
    }

    try {
      setError(null);
      const response = await fetch(API_URL + "api/v1/game/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player1_name: playerName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      await localStorage.setItem("role", data.role);
      await localStorage.setItem("token", data.token);
      navigate(`/game/${data.game_id}`);
    } catch (err: any) {
      console.log(err);
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
      const response = await fetch(API_URL + "api/v1/game/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ player_name: playerName, code: joinGameCode }),
      });

      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(`Error: ${errorDetail.detail || response.statusText}`);
      }

      const data = await response.json();
      await localStorage.setItem("role", data.role);
      await localStorage.setItem("token", data.token);
      navigate(`/game/${data.game_id}`);
    } catch (err: any) {
      console.log(err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 via-neutral-800 to-red-500 text-white/90 p-4">
      <h1 className="font-outfit text-6xl font-extrabold text-center mt-6 mb-4 bg-gradient-to-br from-[#D10000] from-50% to-[#027DFF] to-65% bg-clip-text text-transparent">
        RED & BLUE.
      </h1>

      <div className="w-full max-w-lg mt-2 flex flex-col items-center">
        <input
          type="text"
          className="w-full border border-gray-500 bg-gray-500 rounded p-2 text-center mb-4"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />

        {error && !isModalOpen && (
          <div className="text-red-600 font-semibold pb-4">{error}</div>
        )}

        <section className="w-full max-w-lg h-auto flex flex-row justify-center items-center text-center gap-8">
          <div className="w-full flex flex-col items-center gap-2">
            <button
              className="w-full bg-blue-500 hover:from-red-600 hover:via-purple-600 hover:to-blue-600 text-white hover:text-gray-200 font-semibold py-2 px-4 rounded transition ease-in-out duration-1000"
              onClick={createGame}
            >
              Create lobby
            </button>
          </div>

          <div className="w-px h-10 bg-gray-500"></div>

          <div className="w-full flex flex-col items-center gap-2">
            <button
              className="w-full bg-red-500 text-white hover:text-gray-200 font-semibold py-2 px-4 rounded transition ease-in-out duration-1000"
              onClick={() => {
                setIsModalOpen(true), setError(null);
              }}
            >
              Join lobby
            </button>
          </div>
        </section>

        {isModalOpen && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center border border-gray-500 bg-white bg-opacity-10 backdrop-blur-md rounded p-6 shadow-md text-center gap-8">
            <div className="bg-neutral-800 p-6 rounded shadow-lg max-w-sm w-full text-center">
              <h2 className="text-xl font-bold mb-4 text-white/80">
                Join a game
              </h2>
              {error && (
                <div className="text-red-600 font-semibold pb-4">{error}</div>
              )}
              <input
                type="text"
                className="w-full border border-gray-500 bg-gray-500 rounded p-2 text-center mb-4"
                placeholder="Game Code"
                value={joinGameCode}
                onChange={(e) => setJoinGameCode(e.target.value)}
              />
              <div className="flex justify-between">
                <button
                  className="bg-gray-600 hover:bg-gray-600/80 text-white px-4 py-2 rounded"
                  onClick={() => {
                    setIsModalOpen(false), setError(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-gradient-to-br from-red-400 to-blue-400 hover:from-blue-600 hover:via-purple-600 hover:to-red-600 text-white hover:text-gray-200 px-4 py-2 rounded inline-flex text-center items-center gap-1"
                  onClick={joinGame}
                >
                  Join the game <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        )}

        <section>
          <a href="/how-to-play">
            <span className="pt-4 text-gray-400 hover:text-gray-400/80 inline-flex items-center gap-1 hover:gap-2 transition ease-in-out duration-1000">
              Don't know how to play? <CgArrowLongRight />
            </span>
          </a>
        </section>
      </div>
    </div>
  );
}
