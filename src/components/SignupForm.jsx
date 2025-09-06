// src/components/SignupForm.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAuth, signOut } from "firebase/auth";

const SignupForm = () => {
  const { signup, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await signup(email, password);
      // Immediately sign out after registration
      await signOut(getAuth());
      setSuccess("User Registered Successfully!");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

//   const handleGoogleSignup = async () => {
//     setError("");
//     setSuccess("");
//     setLoading(true);
//     try {
//       await loginWithGoogle();
//       setSuccess("User Registered Successfully!");
//     } catch (err) {
//       setError(err.message);
//     }
//     setLoading(false);
//   };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded" disabled={loading}>
          {loading ? <span className="loader"></span> : "Sign Up"}
        </button>
      </form>
      {/* <button onClick={handleGoogleSignup} className="w-full mt-4 bg-red-500 text-white p-2 rounded" disabled={loading}>
        {loading ? <span className="loader"></span> : "Sign Up with Google"}
      </button> */}
    </div>
  );
};

export default SignupForm;
