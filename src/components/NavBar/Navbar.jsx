import React from "react";
import "./Navbar.scss";
import { useNavigate } from "react-router-dom";
const Navbar = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="navbar-wrapper">
        <div className="nav-btn-container">
          <button className="signup">Signup</button>
          <button
            onClick={() => {
              navigate("/signup");
            }}
            className="signin"
          >
            Signin
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
