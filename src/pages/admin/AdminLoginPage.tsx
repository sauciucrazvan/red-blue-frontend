import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}api/v1/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("admin_token", data.admin_token);
        navigate("/admin");
      } else {
        toast.error("Invalid password. Please try again.", {
          position: "bottom-right",
        });
      }
    } catch {
      toast.error("An error occurred. Please try again.", {
        position: "bottom-right",
      });
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
        <h1 className="font-outfit text-4xl font-extrabold text-center mt-6 mb-4 bg-gradient-to-br from-[#D10000] from-50% to-[#027DFF] to-65% bg-clip-text text-transparent">
          RED & BLUE.
        </h1>

        <h6 className="text-md text-gray-100/80 mb-4">
          Login as an administrator.
        </h6>

        <div className="flex flex-col w-1/4 text-gray-200 gap-1">
          Username
          <input
            type="text"
            placeholder="Enter username"
            disabled={true}
            className="p-2 rounded-lg mb-4"
            value={"admin"}
          />
        </div>

        <div className="flex flex-col w-1/4 text-gray-200 gap-1">
          Password
          <input
            type="password"
            placeholder="Enter password"
            className="p-2 rounded-lg mb-4 bg-gray-700 hover:bg-gray-800 focus:bg-gray-800 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          className="bg-blue-500 text-white p-2 rounded-lg w-1/4"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </>
  );
}
