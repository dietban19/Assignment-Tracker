import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { db } from "../../config/firebase";
import { doc, setDoc } from "firebase/firestore";

const Details = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleDetailsSubmit = async (event) => {
    event.preventDefault(); // Prevent the form from refreshing the page

    if (auth.currentUser) {
      // Create an object with the user's first and last name
      const details = { firstName, lastName };
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userDocRef, details, { merge: true }); // Use merge to not overwrite existing fields
        navigate("/dashboard"); // After saving details, go to dashboard
      } catch (error) {
        console.error("Error saving user details:", error);
      }
    } else {
      console.error("No user is signed in.");
      // Redirect to sign-in page or show an error message
    }
  };

  return (
    <div>
      <h1>User Details</h1>
      <form onSubmit={handleDetailsSubmit}>
        <div>
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="lastName">Last Name:</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Details;
