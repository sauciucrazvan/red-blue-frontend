import { useState } from "react";
import { MessageSquare } from "lucide-react";

const ChatPopup = ({ currentRound }: { currentRound: number }) => {
  const [open, setOpen] = useState(false);
  const isAvailable = currentRound === 4 || currentRound === 8;

  const togglePopup = () => {
    if (isAvailable) {
      setOpen(!open);
    }
  };

  return (
    <div className="relative z-50">
      <div className="group relative">
        <button
          className={`p-3 rounded-full shadow-lg ${
            isAvailable ? "bg-white/20 hover:bg-white/30" : "bg-white/10 cursor-not-allowed"
          }`}
          onClick={togglePopup}
        >
          <MessageSquare className="text-white" />
        </button>

        {!isAvailable && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            Available only on round 4 and 8
          </div>
        )}
      </div>

      {open && isAvailable && (
        <div className="absolute bottom-12 right-0 w-[40rem] bg-black/90 backdrop-blur-lg rounded-xl shadow-lg p-4 text-white">
          <div className="font-bold mb-2">Chat</div>
          <div className="h-40 overflow-y-auto text-sm mb-2">
            <p className="text-gray-300">💬 Chat feature coming soon!</p>
          </div>
          <input
            type="text"
            disabled
            placeholder="Type your message..."
            className="w-full p-2 rounded bg-white/10 text-white outline-none text-sm"
          />
        </div>
      )}
    </div>
  );
};

export default ChatPopup;
