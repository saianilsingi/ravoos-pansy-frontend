import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Create Account | Ravoos Pansy";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("auth/signup/", {
        name,
        email,
        password,
      });

      navigate("/login");
    } catch {
      setError("Signup failed. Try again.");
    }
  };

  const inputClass = "w-full border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 placeholder:text-stone-400 dark:placeholder:text-stone-500 transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50 dark:bg-stone-950">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                      rounded-xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-2">Create Account</h2>

        <p className="text-center text-stone-500 dark:text-stone-400 mb-6">
          Join Ravoos Pansy today
        </p>

        {error && (
          <p className="text-red-500 dark:text-red-400 text-sm text-center mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} />

          <button
            type="submit"
            className="w-full bg-amber-600 dark:bg-amber-500 text-white py-2.5 rounded-lg font-semibold
                       hover:bg-amber-700 dark:hover:bg-amber-400 shadow-md hover:shadow-lg transition-all"
          >
            Create Account
          </button>
        </form>

        <p className="text-sm text-center text-stone-500 dark:text-stone-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
