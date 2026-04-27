import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import TakeQuiz from "./pages/TakeQuiz";
import Profile from "./pages/Profile";

function App() {
  const { token, user } = useAuth();

  if (!token) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen fade-in">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/admin"
            element={
              user?.role === "admin" ? <AdminPanel /> : <Navigate to="/" />
            }
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/quiz/:id" element={<TakeQuiz />} />
          <Route path="/login" element={<Navigate to="/" />} />
          <Route path="/register" element={<Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
