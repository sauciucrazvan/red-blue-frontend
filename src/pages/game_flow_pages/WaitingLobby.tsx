import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL, WS_URL } from "../../config";
import { FaCopy, FaLink } from "react-icons/fa6";
import { motion } from "framer-motion";
import LoadingPage from "../system_pages/Loading";
import ErrorPage from "../system_pages/ErrorPage";
import AnimatedDots from "../../components/AnimatedDots";
import { toastErrorWithSound } from "../../components/toastWithSound";
import { CgArrowLongRight } from "react-icons/cg";

export default function WaitingLobby() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [lobbyType, setLobbyType] = useState<string>("private");

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
    if (
      data &&
      data.game_state === "active" &&
      data.player1_name &&
      data.player2_name
    ) {
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

      let interval: any;
      if (data.game_state === "waiting")
        interval = setInterval(() => {
          const now = new Date();
          if (now >= localExpDate) {
            clearInterval(interval);
            toast.error("Lobby expired.");
            navigate(`/`);
          }
        }, 10000);
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

      let interval: any;
      interval = setInterval(() => {
        const now = new Date();
        if (now >= localExpDate) {
          clearInterval(interval);
          toast.error("Lobby expired.");
          navigate(`/`);
        }
      }, 10000);
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

  const handleLobbyTypeChange = () => {
    setLobbyType((prevType) => (prevType === "public" ? "private" : "public"));
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Invalid token. Please log in again.");
      return;
    }

    fetch(`${API_URL}api/v1/game/${id}/change_visibility`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        toast.success(data.message || "Lobby type changed successfully.");
      })
      .catch((err) => {
        toastErrorWithSound(err.message || "Failed to change lobby type.");
      });
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
        <h2 className="text-xl font-bold">
          Waiting for the opponent
          {data.game_state === "pause" && <span> to come back</span>}
          <AnimatedDots />
          <p className="text-xs font-normal text-white italic">
            The game will start once{" "}
            {data.game_state === "pause" && "again when"} your opponent joins.
          </p>
        </h2>

        <p className="text-lg">
          You are playing as <b>{localStorage.getItem("player_name")}</b>.
          <br />
          Share this with your opponent:
        </p>

        <div className="text-sm text-white-400 flex flex-col items-center justify-between gap-2 w-full mt-4">
          <div className="flex flex-row items-center flex-1 min-w-0 ">
            <input
              type="text"
              value={data.code}
              disabled
              className="bg-gray-800 text-white text-center font-bold px-2 py-1 rounded-l-md w-full cursor-default h-10 bg-opacity-40 min-w-0"
              readOnly
            />
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(data.code);
                  toast.success("Code copied to clipboard");
                } catch (err) {
                  toast.error("Failed to copy code");
                }
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-r-md flex items-center h-10 transition ease-in-out duration-1000"
              title="Copy invite code"
              type="button"
            >
              <FaCopy />
            </button>
          </div>
          <div className="flex-shrink-0 px-2 text-center">⸻ OR ⸻</div>
          <div className="flex flex-1 justify-end w-[65%]">
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
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold p-2 rounded-md flex gap-1 items-center justify-center h-10 w-full transition ease-in-out duration-1000"
              title="Copy invite link"
              type="button"
            >
              <FaLink /> Copy invite link
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-1">
          {data.game_state === "waiting" && (
            <>
              <div className="flex flex-row items-center justify-center gap-2 text-center rounded-lg bg-gray-800 bg-opacity-30 p-2">
                <span className="text-sm">Make lobby private</span>
                <button
                  className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none ${
                    lobbyType === "private" ? "bg-orange-500" : "bg-gray-700"
                  }`}
                  onClick={handleLobbyTypeChange}
                  aria-label="Toggle lobby type"
                  type="button"
                >
                  <span
                    className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white shadow-md transition-transform duration-300`}
                    style={{
                      transform:
                        lobbyType === "private"
                          ? "translateX(20px)"
                          : "translateX(0)",
                    }}
                  />
                </button>
              </div>
            </>
          )}
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
          </div>
          {data.game_state === "waiting" && (
            <button
              className="mt-0 underline text-white hover:text-gray-300"
              onClick={destroyGame}
            >
              <span className="text-white text-sm hover:text-orange-600/80 inline-flex items-center gap-1 hover:gap-2 transition ease-in-out duration-1000">
                Return to Main Menu <CgArrowLongRight />
              </span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
