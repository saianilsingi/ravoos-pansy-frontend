import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login | Ravoos Pansy";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("auth/login/", {
        email,
        password,
      });

      login(res.data);
      navigate("/");
    } catch {
      setError("Invalid email or password");
    }
  };

  const inputClass = "w-full border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 placeholder:text-stone-400 dark:placeholder:text-stone-500 transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50 dark:bg-stone-950">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                      rounded-xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-2">Login</h2>

        <p className="text-center text-stone-500 dark:text-stone-400 mb-6">
          Welcome back to Ravoos Pansy
        </p>

        {error && (
          <p className="text-red-500 dark:text-red-400 text-sm text-center mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} />

          <button
            type="submit"
            className="w-full bg-amber-600 dark:bg-amber-500 text-white py-2.5 rounded-lg font-semibold
                       hover:bg-amber-700 dark:hover:bg-amber-400 shadow-md hover:shadow-lg transition-all"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center text-stone-500 dark:text-stone-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}
