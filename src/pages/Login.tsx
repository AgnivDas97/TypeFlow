import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import * as auth from "../services/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    type AuthError = {
      response?: {
        data?: {
          error?: string;
        };
      };
    };

    try {
      const user = await auth.login(email, password);
      setUser(user);
      navigate("/");
    } catch (err: unknown) {
      const error = err as AuthError;
      if (
        typeof err === "object" &&
        err !== null &&
        error.response &&
        typeof error.response === "object" &&
        error.response !== null &&
        error.response.data &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "error" in error.response.data
      ) {
        alert(error.response.data.error || "Login failed");
      } else {
        alert("Login failed");
      }
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl mb-4">Login</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <input
          className="border p-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-blue-500 text-white p-2 rounded">Login</button>
      </form>
      <p className="mt-3 text-sm">
        No account? <Link to="/signup" className="text-blue-600">Sign up</Link>
      </p>
    </div>
  );
}
