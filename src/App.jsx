import React from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Feed from './pages/Feed';
import { useAuth } from './context/AuthContext';
import Profile from "./pages/Profile";
import QuestionDetail from "./pages/QuestionDetail";

const Navbar = () => {
  const { user, logout } = useAuth();
  return (
    <nav className="flex items-center justify-between p-4 bg-blue-600 text-white">
      <div>
        <span className="font-bold text-xl">Q&A Forum</span>
      </div>
      <div className="space-x-4">
        {user ? (
          <>
            <Link to="/profile">Profile</Link>
            <button onClick={logout} className="bg-red-500 px-3 py-1 rounded">Logout</button>
          </>
        ) : null}
      </div>
    </nav>
  );
};

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  return user ? children : <Navigate to="/auth" state={{ from: location }} replace />;
}

function App() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/feed" replace /> : <Home />} />
        <Route path="/auth" element={user ? <Navigate to="/feed" replace /> : <Auth />} />
        <Route path="/feed" element={
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/question/:id" element={
          <ProtectedRoute>
            <QuestionDetail />
          </ProtectedRoute>
        } />
        {/* Redirect all other routes */}
        <Route path="*" element={<Navigate to={user ? "/feed" : "/auth"} replace />} />
      </Routes>
    </>
  );
}

export default App;
