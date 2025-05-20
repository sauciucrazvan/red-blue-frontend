import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface ChatPopupProps {
  currentRound: number;
  onClose: () => void;
  socket: WebSocket;
}

const ChatPopup = ({ currentRound, onClose, socket }: ChatPopupProps) => {
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll la ultimul mesaj
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Primește mesaje de la WebSocket
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat-message") {
        setChatMessages((prev) => [...prev, `${data.sender}: ${data.message}`]);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);

  const sendMessage = () => {
    if (message.trim()) {
      // Afișează local
      setChatMessages((prev) => [...prev, `You: ${message}`]);

      // Trimite prin WebSocket
      socket.send(JSON.stringify({ type: "chat-message", sender: message }));

      setMessage("");
    }
  };

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

      <div className="h-48 overflow-y-auto bg-white/10 p-3 rounded-lg mb-4">
        {chatMessages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mb-2"
          >
            • {msg}
          </motion.div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="w-full p-2 rounded bg-white/10 text-white placeholder-gray-300 mb-2 outline-none"
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
