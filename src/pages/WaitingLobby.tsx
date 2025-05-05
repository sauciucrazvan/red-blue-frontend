import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { WS_URL } from "../config";
import { FaClipboard, FaCopy } from "react-icons/fa6";

interface WaitingLobbyProps {
  id: string;
  game_code: string;
}

export default function WaitingLobby(props: WaitingLobbyProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!props.id || !props.game_code) {
      console.error("Missing id or game_code...");
      navigate("/404");
      return;
    }

    let ws: WebSocket;

    const initializeWebSocket = () => {
      try {
        ws = new WebSocket(`${WS_URL}ws/game/${props.id}`);

        ws.onopen = () => {
          console.log("WebSocket connection established in WaitingLobby");
        };

        ws.onmessage = (event) => {
          try {
            const wsData = JSON.parse(event.data);
            if (wsData.state === "active") {
              console.log("Player connected, refreshing...");
              window.location.reload();
            }
          } catch (err) {
            console.error("Failed to parse WebSocket message:", err);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
          console.log("WebSocket connection closed in WaitingLobby");
        };
      } catch (err) {
        console.error("WebSocket initialization error:", err);
      }
    };

    initializeWebSocket();
  }, [props.id]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(props.game_code);
      toast.success("Copied to clipboard", {});
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error(
        "❌ Failed to copy. Please check your browser settings or permissions."
      );
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-700 via-purple-300 to-blue-700 text-gray-800">
        <div className="bg-black bg-opacity-10 backdrop-blur-md border border-white border-opacity-30 rounded-2xl shadow-xl p-10 max-w-md w-full text-center space-y-6">
          <h2 className="text-2xl font-bold">Waiting for the opponent...</h2>
          <p className="text-lg">
            You're playing as <b>{localStorage.getItem("player_name")}</b>.
            <br />
            Share this code with your opponent:
          </p>
          <div
            onClick={copyToClipboard}
            className="inline-flex items-center gap-1 cursor-pointer text-lg text-slate-800 hover:text-slate-800/80 transition"
            title="Click to copy"
          >
            {props.game_code} <FaCopy />
          </div>
          <p className="text-sm text-gray-700 italic">
            The game will (hopefully) start once your opponent joins.
          </p>
        </div>
      </div>
    </>
  );
}
