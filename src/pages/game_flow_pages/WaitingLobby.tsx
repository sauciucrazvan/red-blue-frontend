import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL, WS_URL } from "../../config";
import { FaCopy } from "react-icons/fa6";
import { motion } from "framer-motion";
import LoadingPage from "../system_pages/Loading";
import ErrorPage from "../system_pages/ErrorPage";
import AnimatedDots from "../../components/AnimatedDots";
import { toastErrorWithSound } from "../../components/toastWithSound";

export default function WaitingLobby() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const [expHours, setExpHours] = useState<string>("00");
  const [expMinutes, setExpMinutes] = useState<string>("00");

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Invalid token.");
        const response = await fetch(`${API_URL}api/v1/game/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          if (response.status === 404) navigate("/404");
          throw new Error(response.statusText);
        }
        const data = await response.json();
        setData(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchGame();
  }, [id, navigate]);

  useEffect(() => {
    if (data && data.game_state === "active") {
      navigate(`/game/${id}`);
    }

    if (data && data.created_at) {
      const expDate = new Date(data.created_at);
      expDate.setMinutes(expDate.getMinutes() + 10);

      // Converting to users' local timezone (hopefully)
      const localExpDate = new Date(
        expDate.getTime() + expDate.getTimezoneOffset() * 60000 * -1
      );

      setExpHours(localExpDate.getHours().toString().padStart(2, "0"));
      setExpMinutes(localExpDate.getMinutes().toString().padStart(2, "0"));
    }

    if (data && data.game_state === "pause") {
      let expDate = new Date(data.player1_disconnected_at);
      if (data.player2_disconnected_at)
        expDate = new Date(data.player2_disconnected_at);

      expDate.setMinutes(expDate.getMinutes() + 10);

      // Converting to users' local timezone (hopefully)
      const localExpDate = new Date(
        expDate.getTime() + expDate.getTimezoneOffset() * 60000 * -1
      );

      setExpHours(localExpDate.getHours().toString().padStart(2, "0"));
      setExpMinutes(localExpDate.getMinutes().toString().padStart(2, "0"));
    }
  }, [data]);

  useEffect(() => {
    let ws: WebSocket;

    const initializeWebSocket = () => {
      try {
        ws = new WebSocket(`${WS_URL}ws/game/${id}`);

        ws.onopen = () => {
          console.log("WebSocket connection established in WaitingLobby");
        };

        ws.onmessage = (event) => {
          try {
            const wsData = JSON.parse(event.data);
            if (wsData.game_state === "active") {
              console.log("Player connected, joining game...");
              navigate(`/game/${id}`);
            }
          } catch (err) {
            console.error("Failed to parse WebSocket message:", err);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        // ws.onclose = () => {
        //   console.log("WebSocket connection closed in WaitingLobby");
        // };
      } catch (err) {
        console.error("WebSocket initialization error:", err);
      }
    };

    initializeWebSocket();
  }, [id]);

  const destroyGame = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error(
        "Something went wrong: invalid token. The game will automatically be deleted in 10 minutes."
      );
      navigate(`/`);
      return;
    }

    try {
      const response = await fetch(API_URL + `api/v1/game/${id}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const data = await response.json();
      console.log(data.message);
      navigate(`/`);
      toast.success(data.message);
    } catch (err: any) {
      toastErrorWithSound(err.message || "Something went wrong.");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(data.code);
      toast.success("Copied to clipboard", {});
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error(
        "\u274C Failed to copy. Please check your browser settings or permissions."
      );
    }
  };

  if (loading) return LoadingPage();
  if (error) return ErrorPage(error);
  if (!data) return ErrorPage("Failed to fetch data!");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-700 to-blue-700 text-white">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-black bg-opacity-10 backdrop-blur-md border border-white border-opacity-30 rounded-2xl shadow-xl p-10 max-w-md w-full text-center space-y-6"
      >
        <h2 className="text-2xl font-bold">
          Waiting for the opponent{" "}
          {data.game_state === "pause" && <span>to come back</span>}
          <AnimatedDots />
        </h2>
        <p className="text-lg">
          You are playing as <b>{localStorage.getItem("player_name")}</b>.
          <br />
          Share this code with your opponent:
        </p>
        <div
          onClick={copyToClipboard}
          className="inline-flex items-center gap-1 cursor-pointer text-lg text-white font-bold hover:text-white/80 transition"
          title="Click to copy"
        >
          {data.code} <FaCopy />
        </div>

        <div className="text-sm text-white-400">
          <p>or send this link to your opponent:</p>
          <div className="flex items-center mt-2">
            <input
              type="text"
              value={`${window.location.origin}/game/join/${
                data.code
              }?ref=${localStorage.getItem("player_name")}`}
              disabled
              className="bg-gray-800 text-white font-bold px-2 py-1 rounded-l-md w-full cursor-default h-10 bg-opacity-40"
              readOnly
            />
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    `${window.location.origin}/game/join/${
                      data.code
                    }?ref=${localStorage.getItem("player_name")}`
                  );
                  toast.success("Link copied to clipboard");
                } catch (err) {
                  toast.error("Failed to copy link");
                }
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-r-md flex items-center h-10"
              title="Copy invite link"
              type="button"
            >
              <FaCopy />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="text-center">
            <span className="text-md text-white non-italic">
              The lobby will expire at{" "}
              <b>
                {expHours}:{expMinutes}
              </b>{" "}
              {data.game_state === "pause"
                ? "if he does not join back."
                : "if no one joins."}
            </span>
            <p className="text-xs text-white italic">
              The game will start once{" "}
              {data.game_state === "pause" && "again when"} your opponent joins.
            </p>
          </div>
          {data.game_state === "waiting" && (
            <button
              onClick={destroyGame}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded shadow-md"
            >
              Cancel & Return
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
