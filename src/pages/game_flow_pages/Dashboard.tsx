import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../../config";
import { toastErrorWithSound } from "../../components/toastWithSound";
import AnimatedDots from "../../components/AnimatedDots";
import PublicGamesTable from "./components/PublicGamesTable";

export default function Dashboard() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState(
    localStorage.getItem("player_name") ?? ""
  );
  const [joinGameCode, setJoinGameCode] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showJoinOptionsModal, setShowJoinOptionsModal] = useState(false);
  const [showPublicGamesModal, setShowPublicGamesModal] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [lastGame, setLastGame] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
      localStorage.setItem("game_id", data.game_id);
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
      localStorage.setItem("game_id", data.game_id);
      navigate(`/game/${data.game_id}`);
    } catch (err: any) {
      toastErrorWithSound(err.message || "Something went wrong.");
    }
  };

  useEffect(() => {
    const fetchLastGame = async () => {
      const last_game_id = localStorage.getItem("game_id");
      const token = localStorage.getItem("token");

      const response = await fetch(API_URL + `api/v1/game/${last_game_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      if (!response.ok) {
        const errorDetail = await response.json();
        localStorage.removeItem("game_id");
        if (response.status === 404) return;
        throw new Error(`Error: ${errorDetail.detail || response.statusText}`);
      }

      const data = await response.json();
      if (data.game_state !== "pause") {
        localStorage.removeItem("game_id");
        return;
      }
      setLastGame(data);
    };

    fetchLastGame();
  }, []);

  useEffect(() => {
    if (!showJoinModal) return;
    const handleESC = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowJoinModal(false);
    };
    window.addEventListener("keydown", handleESC);
    return () => window.removeEventListener("keydown", handleESC);
  }, [showJoinModal]);

  useEffect(() => {
    if (!showJoinOptionsModal) return;
    const handleESC = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowJoinOptionsModal(false);
    };
    window.addEventListener("keydown", handleESC);
    return () => window.removeEventListener("keydown", handleESC);
  }, [showJoinOptionsModal]);

  useEffect(() => {
    if (!showHowToPlay && buttonRef.current) {
      buttonRef.current.blur();
    }
    if (!showHowToPlay) return;
    const handleESC = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowHowToPlay(false);
    };
    window.addEventListener("keydown", handleESC);
    return () => window.removeEventListener("keydown", handleESC);
  }, [showHowToPlay]);

  useEffect(() => {
    if (showJoinModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showJoinModal, inputRef]);

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
              onClick={() => setShowJoinOptionsModal(true)}
            >
              Join a Game
            </button>
          </div>

          {lastGame && (
            <section className="text-white text-md font-semibold flex flex-col items-center gap-2 rounded-md px-6 py-2 bg-gray-800 bg-opacity-25">
              <div className="flex flex-col items-center">
                <span>You've been disconnected from a game!</span>
                <small className="font-normal text-gray-300">
                  Your opponent is waiting for you to join back
                  <AnimatedDots />
                </small>
              </div>

              <a
                href={`${window.location.origin}/game/join/` + lastGame.code}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-md text-sm"
              >
                Reconnect
              </a>
            </section>
          )}

          <div className="flex flex-row items-center gap-2 text-white">
            <a
              href="/about"
              className="hover:text-gray-100/80 transition ease-in-out duration-1000"
            >
              About
            </a>
            •
            <button
              className="mt-0 underline text-white hover:text-gray-300"
              onClick={() => setShowHowToPlay(true)}
              ref={buttonRef}
            >
              <span className="text-white hover:text-gray-100/80 inline-flex items-center gap-1 transition ease-in-out duration-1000">
                Don't know how to play?
              </span>
            </button>
          </div>
        </motion.div>

        {/* Join Options Modal */}
        <AnimatePresence>
          {showJoinOptionsModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
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
                <h2 className="text-xl font-bold mb-4 text-center">
                  Join a Game
                </h2>
                <div className="flex flex-col gap-4">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                    onClick={() => {
                      setShowJoinOptionsModal(false);
                      setShowJoinModal(true);
                    }}
                  >
                    Join via a code
                  </button>
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
                    onClick={() => {
                      setShowJoinOptionsModal(false);
                      setShowPublicGamesModal(true);
                    }}
                  >
                    Join a public lobby
                  </button>
                  <button
                    className="bg-gray-400 hover:bg-gray-500 text-gray-800 font-semibold py-2 px-4 rounded"
                    onClick={() => setShowJoinOptionsModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Join Game Modal */}
        <AnimatePresence>
          {showJoinModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
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
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    joinGame();
                  }}
                >
                  <input
                    className="w-full border border-gray-400 rounded text-gray-800 p-2 text-center mb-4"
                    ref={inputRef}
                    type="text"
                    placeholder="Game code"
                    value={joinGameCode}
                    onChange={(e) => setJoinGameCode(e.target.value)}
                  />
                  <div className="flex justify-between">
                    <button
                      className="bg-gray-400 hover:bg-gray-500 text-gray-800 font-semibold py-2 px-4 rounded"
                      type="button"
                      onClick={() => setShowJoinModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                    >
                      Join Game
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Public Games Modal */}
        <AnimatePresence>
          {showPublicGamesModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-black bg-opacity-20 backdrop-blur-md rounded p-6 text-white shadow-lg w-full max-w-lg"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-xl font-bold mb-4 text-center">
                  Public Lobbies
                </h2>
                <PublicGamesTable
                  onClose={() => setShowPublicGamesModal(false)}
                  onJoin={(code: string) => {
                    setJoinGameCode(code);
                    setShowPublicGamesModal(false);
                    setShowJoinModal(true);
                  }}
                />
                <div className="mt-4 flex justify-center">
                  <button
                    className="bg-gray-400 hover:bg-gray-500 text-gray-800 font-semibold py-2 px-4 rounded"
                    onClick={() => setShowPublicGamesModal(false)}
                  >
                    Close
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
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <button
                      className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded"
                      onClick={() => setShowHowToPlay(false)}
                    >
                      Close
                    </button>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
