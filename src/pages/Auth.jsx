// src/pages/Auth.jsx
import React, { useState } from "react";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="mb-4">
        <button
          className={`px-4 py-2 rounded-l ${isLogin ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setIsLogin(true)}
        >
          Login
        </button>
        <button
          className={`px-4 py-2 rounded-r ${!isLogin ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setIsLogin(false)}
        >
          Sign Up
        </button>
      </div>
      {isLogin ? <LoginForm /> : <SignupForm />}
    </div>
  );
};

export default Auth;
