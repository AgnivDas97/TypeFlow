import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import * as auth from "../services/auth";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    // Define a type for the error object
    type ErrorResponse = {
      response?: {
        data?: {
          error?: string;
        };
      };
    };

    try {
      const user = await auth.signup(name, email, password);
      setUser(user);
      navigate("/");
    } catch (err: unknown) {
      const errorObj = err as ErrorResponse;
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof errorObj.response === "object" &&
        errorObj.response !== null &&
        "data" in errorObj.response!
      ) {
        alert(errorObj.response?.data?.error || "Signup failed");
      } else {
        alert("Signup failed");
      }
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl mb-4">Signup</h1>
      <form onSubmit={handleSignup} className="flex flex-col gap-3">
        <input
          className="border p-2"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
        <button className="bg-green-500 text-white p-2 rounded">Signup</button>
      </form>
      <p className="mt-3 text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600">Login</Link>
      </p>
    </div>
  );
}
