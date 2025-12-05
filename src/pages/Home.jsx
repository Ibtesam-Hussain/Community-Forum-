// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Welcome to Community Q&A Forum</h1>
      <button
        className="bg-blue-600 text-white px-6 py-3 rounded text-lg hover:bg-blue-700"
        onClick={() => navigate("/auth")}
      >
        Get Started with us 
      </button>
    </div>
  );
};

export default Home;
