import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";

interface ChatPopupProps {
  currentRound: number;
  onClose: () => void;
  socket: WebSocket;
  myRole: string;
  player1Name: string;
  player2Name: string;
}

interface ChatMessage {
  sender: string;
  message: string;
  self: boolean;
}

const ChatPopup = ({
  currentRound,
  onClose,
  socket,
  myRole,
  player1Name,
  player2Name,
}: ChatPopupProps) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [opponentReady, setOpponentReady] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const opponentName = useMemo(
    () => (myRole === "player1" ? player2Name : player1Name),
    [myRole, player1Name, player2Name]
  );
  const myName = useMemo(
    () => (myRole === "player1" ? player1Name : player2Name),
    [myRole, player1Name, player2Name]
  );

  // Scroll to last message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Notify server that this player has opened the chat
  useEffect(() => {
    const sendAgree = () => {
      socket.send(
        JSON.stringify({ type: "chat-agree", sender: myRole, name: myName })
      );
    };
    if (socket.readyState === WebSocket.OPEN) {
      sendAgree();
    } else {
      socket.addEventListener("open", sendAgree, { once: true });
    }
  }, [socket, myRole, myName]);

  // Receive messages from WebSocket
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat-message") {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: data.sender,
            message: data.message,
            self: data.sender === myRole,
          },
        ]);
      }
      if (data.type === "chat-agree" && data.sender !== myRole) {
        setOpponentReady(true);
      }
      if (data.type === "chat-request" && data.sender !== myRole) {
        setOpponentReady(false);
      }
    };
    socket.addEventListener("message", handleMessage);
    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, myRole]);

  const sendMessage = useCallback(() => {
    if (message.trim() && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "chat-message",
          sender: myRole,
          message,
        })
      );
      setMessage("");
    }
  }, [message, socket, myRole]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") sendMessage();
    },
    [sendMessage]
  );

  // Reset chat state on round change (keep opponentName)
  useEffect(() => {
    setOpponentReady(false);
    setChatMessages([]);
  }, [currentRound]);

  // Chat status message
  const chatStatus = useMemo(
    () =>
      opponentReady
        ? (
            <>
              <span className="text-blue-400 font-bold">{opponentName}</span> is ready to chat with you
            </>
          )
        : (
            <>
              <span className="text-blue-400 font-bold">{opponentName}</span> isn't ready to chat
            </>
          ),
    [opponentReady, opponentName]
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: 30 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        rotateX: 0,
        transition: { duration: 0.5, ease: "easeOut", delay: 0.1 },
      }}
      exit={{
        opacity: 0,
        scale: 0.8,
        y: 50,
        rotateX: 30,
        transition: { duration: 0.5, ease: "easeInOut" },
      }}
      className="bg-black bg-opacity-20 backdrop-blur-md text-white p-6 rounded-lg shadow-lg w-full max-w-md"
    >
      <div className="text-xl font-bold mb-2 text-center">
        Chat - Round {currentRound}
      </div>

      <div className="mb-2 text-center text-white font-semibold">
        {chatStatus}
      </div>

      <div className="h-48 overflow-y-auto bg-white/10 p-3 rounded-lg mb-4">
        {chatMessages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`mb-2 flex ${msg.self ? "justify-end" : "justify-start"}`}
          >
            <span
              className={`inline-block px-3 py-1 rounded-lg max-w-xs break-words ${
                msg.self
                  ? "bg-blue-600 text-white ml-8"
                  : "bg-gray-300 text-black mr-8"
              }`}
            >
              {msg.message}
            </span>
          </motion.div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleInputKeyDown}
        placeholder="Type a message..."
        className="w-full p-2 rounded bg-white/10 text-white placeholder-gray-300 mb-2 outline-none"
        autoFocus
      />
      <button
        onClick={sendMessage}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded mb-2 transition"
      >
        Send
      </button>
      <button
        onClick={onClose}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition"
      >
        Close Chat
      </button>
    </motion.div>
  );
};

export default ChatPopup;
