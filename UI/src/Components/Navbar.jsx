import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  // Detect initial theme:
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    // fallback to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  function logout() {
    localStorage.removeItem("user");
    navigate("/");
  }

  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <nav className="bg-white text-black dark:bg-gray-800 dark:text-white shadow">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg">TypeFlow</Link>

        <div className="flex items-center space-x-4">
            {user && <button>
                <Link to="/previous-tests" className="px-3 py-1 rounded-md border dark:border-gray-700">Previous Tests</Link>
            </button> }
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded-md border dark:border-gray-700"
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>

          {/* Auth buttons */}
          {user ? (
            <>
              <span className="hidden sm:inline">Hi, {user.name}</span>
              <button
                onClick={logout}
                className="px-3 py-1 rounded-md border dark:border-gray-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1 rounded-md border dark:border-gray-700"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-3 py-1 rounded-md border dark:border-gray-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
