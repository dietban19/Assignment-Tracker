import { useState, useEffect, useContext } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
// import Main from "./pages/main/main";
// import Signup from "./pages/auth/signup.js";
// import Profile from "./pages/profile/profile";
import { useUserContext } from "./context/userContext";
import LandingPage from "./pages/LandingPage/landingpage";
import Signup from "./pages/Auth/Signup";
import Assignments from "./pages/Assignments/Assignments";
import Details from "./pages/Auth/Details";
import Dashboard from "./pages/Dashboard/Dashboard";
import CalendarComponent from "./components/Calendar/CalendarComponent";
// import { useUserContext } from "./context/userContext";
function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { loadingAuthState } = useUserContext();
  if (loadingAuthState) {
    return (
      <div className="loader-wrapper">
        <div className="loader-container">
          <span className="loader"></span>
        </div>
      </div>
    );
  }
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />\
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/details" element={<Details />} />
        <Route path="/calendar" element={<CalendarComponent />} />
        {/* <Route path="/main" element={<Main />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} /> */}
      </Routes>
    </>
  );
}

export default App;
