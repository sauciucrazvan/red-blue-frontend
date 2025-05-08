import { useEffect, useRef, useState } from "react";

interface ChatPopupProps {
  currentRound: number;
  onClose: () => void;
}

const ChatPopup = ({ currentRound, onClose }: ChatPopupProps) => {
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = () => {
    if (message.trim()) {
      setChatMessages((prevMessages) => [...prevMessages, message]);
      setMessage("");
    }
  };

  return (
    <div className="bg-black bg-opacity-20 backdrop-blur-md text-white p-6 rounded shadow-lg w-full max-w-md">
      <div className="text-xl font-bold mb-2 text-center">
        Chat - Round {currentRound}
      </div>

      <div className="h-48 overflow-y-auto bg-white/10 p-3 rounded-lg mb-4">
        {chatMessages.map((msg, index) => (
          <div key={index} className="mb-2">
            • {msg}
          </div>
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
    </div>
  );
};

export default ChatPopup;
