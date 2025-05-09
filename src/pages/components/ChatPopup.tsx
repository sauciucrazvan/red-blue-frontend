import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatPopupProps {
  currentRound: number;
  onClose: () => void;
}

const ChatPopup = ({ currentRound, onClose }: ChatPopupProps) => {
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = () => {
    if (message.trim()) {
      setChatMessages((prev) => [...prev, message]);
      setMessage("");
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300); // match exit animation duration
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }} // Adjust opacity for better visibility
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Chat Popup */}
          <motion.div
            key="chat-popup"
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-2xl w-[90vw] max-w-4xl h-[400px] flex flex-col justify-between relative z-10">
              <div className="text-2xl font-bold text-center mb-4">
                Chat - Round {currentRound}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto bg-white/10 p-3 rounded-lg mb-3">
                {chatMessages.map((msg, index) => (
                  <div key={index} className="mb-2">
                    • {msg}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input and Buttons */}
              <div className="flex flex-col space-y-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full p-2 rounded bg-white/10 text-white placeholder-gray-300 outline-none"
                />
                <button
                  onClick={sendMessage}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition"
                >
                  Send
                </button>
                <button
                  onClick={handleClose}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition"
                >
                  Close Chat
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatPopup;
