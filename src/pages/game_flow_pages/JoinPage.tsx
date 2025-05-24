import { useRef, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { API_URL } from "../../config";
import { toastErrorWithSound } from "../../components/toastWithSound";

export default function JoinPage() {
  const { game_code } = useParams();
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const referee = searchParams.get("ref");

  const inputRef = useRef<HTMLInputElement>(null);

  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const [playerName, setPlayerName] = useState(
    localStorage.getItem("player_name") ?? ""
  );

  const joinGame = async () => {
    if (playerName.length < 3 || playerName.length > 16) {
      toastErrorWithSound("Player name must be between 3 and 16 characters.");
      return;
    }

    if (!game_code) {
      toastErrorWithSound("Something went wrong. Please try again.");
      console.log(game_code);
      return;
    }

    if (referee === playerName) {
      toastErrorWithSound("You can't join with your friends username!");
      return;
    }

    try {
      const response = await fetch(API_URL + "api/v1/game/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_name: playerName,
          code: game_code,
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

  useEffect(() => {
    if (!playerName && inputRef.current) {
      inputRef.current.focus();
    } else if (playerName && submitBtnRef.current) {
      submitBtnRef.current.focus();
    }
  }, []);

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
          <section>
            <h2 className="text-lg font-bold text-center text-neutral-200">
              You've been challenged to a game of RED & BLUE
            </h2>
            {referee && (
              <p className="text-md text-gray-300 text-center">
                by your friend, <b>{referee}</b>. Can you beat them?
                <br />
              </p>
            )}
          </section>

          <form
            className="w-full flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              joinGame();
            }}
          >

            <input
              ref={inputRef}
              type="text"
              className="w-full bg-gray-100 border border-gray-400 rounded p-2 text-center"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />

            <div className="w-full flex flex-row items-center justify-center gap-4">
              <button
                ref={submitBtnRef}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded w-[50%] focus:outline-none"
                type="submit"
              >
                Accept Challenge!
              </button>
              {
                // don't know if this is needed, but keeping it commented for now
                /* <a
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded"
                href="/"
              >
                Go to Dashboard
              </a> */
              }
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
