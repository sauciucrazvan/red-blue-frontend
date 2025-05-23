import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
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
        setError("Invalid password. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <h1 className="text-4xl text-white mb-8">Admin Login</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <input
        type="password"
        placeholder="Enter password"
        className="p-2 rounded-lg mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white p-2 rounded-lg"
        onClick={handleLogin}
      >
        Login
      </button>
    </div>
  );
}
