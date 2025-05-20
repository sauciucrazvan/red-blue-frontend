import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../config";
import { toastErrorWithSound } from "./components/toastWithSound";

export default function Dashboard() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState(
    localStorage.getItem("player_name") ?? ""
  );
  const [joinGameCode, setJoinGameCode] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const createGame = async () => {
    if (playerName.length < 3 || playerName.length > 16) {
      toastErrorWithSound("Player name must be between 3 and 16 characters.");
      return;
    }

    try {
      const response = await fetch(API_URL + "api/v1/game/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player1_name: playerName }),
      });

      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const data = await response.json();

      localStorage.setItem("player_name", playerName);
      localStorage.setItem("role", data.role);
      localStorage.setItem("token", data.token);
      navigate(`/game/${data.game_id}`);
    } catch (err: any) {
      toastErrorWithSound(err.message || "Something went wrong.");
    }
  };

  const joinGame = async () => {
    if (playerName.length < 3 || playerName.length > 16) {
      toastErrorWithSound("Player name must be between 3 and 16 characters.");
      return;
    }
    if (!joinGameCode) {
      toastErrorWithSound("Please enter a game code.");
      return;
    }

    try {
      const response = await fetch(API_URL + "api/v1/game/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_name: playerName,
          code: joinGameCode.toUpperCase(),
        }),
      });

      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(`Error: ${errorDetail.detail || response.statusText}`);
      }

      const data = await response.json();
      localStorage.setItem("player_name", playerName);
      localStorage.setItem("role", data.role);
      localStorage.setItem("token", data.token);
      navigate(`/game/${data.game_id}`);
    } catch (err: any) {
      toastErrorWithSound(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-700 to-blue-700 text-gray-800 p-6">
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Logo */}
        <motion.h1
          className="relative text-6xl font-extrabold text-center mt-6 mb-4"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 70, damping: 10 }}
        >
          <span className="relative z-10 text-neutral-200">Red</span>
          <span className="absolute left-1/4 -translate-x-1/2 top-1/2 -translate-y-1/2 w-28 h-28 bg-red-600 rounded-full z-0 opacity-90"></span>
          <span className="relative z-10 text-neutral-200">Blue</span>
          <span className="absolute left-3/4 -translate-x-1/2 top-1/2 -translate-y-1/2 w-28 h-28 bg-blue-600 rounded-full z-0 opacity-90"></span>
        </motion.h1>

        {/* Name Input and Buttons */}
        <motion.div
          className="w-full max-w-md mt-6 flex flex-col items-center gap-4"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 70,
            damping: 10,
            delay: 0.3,
          }}
        >
          <input
            type="text"
            className="w-full bg-gray-100 border border-gray-400 rounded p-2 text-center"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />

          <div className="w-full flex flex-row gap-4">
            <button
              className="w-1/2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded"
              onClick={createGame}
            >
              Start New Game
            </button>
            <button
              className="w-1/2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded"
              onClick={() => setShowJoinModal(true)}
            >
              Enter Game Code
            </button>
          </div>

          <button
            className="mt-0 underline text-white hover:text-gray-300"
            onClick={() => setShowHowToPlay(true)}
          >
            Don't know how to play?
          </button>
        </motion.div>

        {/* Join Game Modal */}
        <AnimatePresence>
          {showJoinModal && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-black bg-opacity-20 backdrop-blur-md rounded p-6 text-white shadow-lg w-full max-w-sm"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-xl font-bold mb-4">Enter Game Code</h2>
                <input
                  type="text"
                  className="w-full border border-gray-400 rounded text-gray-800 p-2 text-center mb-4"
                  placeholder="Game code"
                  value={joinGameCode}
                  onChange={(e) => setJoinGameCode(e.target.value)}
                />
                <div className="flex justify-between">
                  <button
                    className="bg-gray-400 hover:bg-gray-500 text-gray-800 font-semibold py-2 px-4 rounded"
                    onClick={() => setShowJoinModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                    onClick={joinGame}
                  >
                    Join Game
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How to Play Modal */}
        <AnimatePresence>
          {showHowToPlay && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-black bg-opacity-20 backdrop-blur-md text-white p-6 rounded shadow-lg w-full max-w-2xl overflow-y-auto max-h-[90vh]"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-2xl font-bold mb-4 text-center">
                  How to Play
                </h2>
                <p className="mb-2">
                  Once a game starts, the two users will play a total of{" "}
                  <strong>10 rounds</strong>. In each round, they choose between
                  two colors:{" "}
                  <span className="text-red-600 font-bold">RED</span> or{" "}
                  <span className="text-blue-600 font-bold">BLUE</span>.
                </p>
                <table className="w-full text-center mb-4 border border-white/20 text-sm md:text-base text-white">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="py-2">Player 1</th>
                      <th className="py-2">Player 2</th>
                      <th className="py-2">Player 1 Score</th>
                      <th className="py-2">Player 2 Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white/5">
                      <td className="text-red-500 font-semibold">RED</td>
                      <td className="text-red-500 font-semibold">RED</td>
                      <td className="text-green-400 font-medium">+3</td>
                      <td className="text-green-400 font-medium">+3</td>
                    </tr>
                    <tr>
                      <td className="text-red-500 font-semibold">RED</td>
                      <td className="text-blue-500 font-semibold">BLUE</td>
                      <td className="text-red-400 font-medium">-6</td>
                      <td className="text-green-400 font-medium">+6</td>
                    </tr>
                    <tr className="bg-white/5">
                      <td className="text-blue-500 font-semibold">BLUE</td>
                      <td className="text-red-500 font-semibold">RED</td>
                      <td className="text-green-400 font-medium">+6</td>
                      <td className="text-red-400 font-medium">-6</td>
                    </tr>
                    <tr>
                      <td className="text-blue-500 font-semibold">BLUE</td>
                      <td className="text-blue-500 font-semibold">BLUE</td>
                      <td className="text-red-400 font-medium">-3</td>
                      <td className="text-red-400 font-medium">-3</td>
                    </tr>
                  </tbody>
                </table>
                <p className="mb-2">
                  During the game, players can see their score for each past
                  round (e.g. +3, -6, etc.) as well as their total score.
                </p>
                <p className="mb-2">
                  <strong>Rounds 9 and 10</strong> have{" "}
                  <strong>doubled score</strong> values.
                </p>
                <p>
                  <strong>WINNING CONDITION:</strong> A player with a positive
                  score at the end is considered a{" "}
                  <span className="text-green-600 font-bold">winner</span>. A
                  player with a negative or null score has{" "}
                  <span className="text-red-600 font-bold">lost</span>.
                </p>
                <div className="mt-6 text-center">
                  <button
                    className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded"
                    onClick={() => setShowHowToPlay(false)}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
