import React from "react";
import "./auth.scss";
import { useUserContext } from "../../context/userContext";
const Signup = () => {
  const { googleSignIn } = useUserContext();
  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <h1>Create an Account</h1>
        <div className="input-container">
          <input className="auth-input" type="text" required />
          <div className="labelline">Email Address</div>
        </div>
        <span>Already Have an Account? Login</span>
        <div className="separator">
          <div className="line" />
          <span className="or">or</span>
          <div className="line" />
        </div>
        <button onClick={googleSignIn} className="googlesign">
          Sign In Google
        </button>
      </div>
    </div>
  );
};

export default Signup;
