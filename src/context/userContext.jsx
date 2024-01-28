import React, { createContext, useState, useEffect, useContext } from "react";

import { useParams } from "react-router-dom";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  getAdditionalUserInfo,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// Create a context for managing user information
export const UserContext = React.createContext();

const provider = new GoogleAuthProvider();

// Custom hook to access the UserContext
export function useUserContext() {
  return useContext(UserContext);
}

// Provider component to wrap the application and provide user context
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // State for storing the current user
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuthState, setLoadingAuthState] = useState(true); // State to track loading of auth state
  const navigate = useNavigate(); // Hook for navigating between routes
  const [isNewGoogleUser, setIsNewGoogleUser] = useState(false);

  async function addNewGoogleUser(result) {
    const addUserData = {
      username: result.user.email.split("@")[0],
      id: result.user.uid,
      email: result.user.email,
      photoURL: "",
      loggedIn: true,
      firstName: "",
      lastName: "",
      age: "",
      sex: "",
      registered: true,
      admin: false,
    };
    console.log("user Data", addUserData);
    const userDocRef = doc(db, "users", result.user.uid);
    await setDoc(userDocRef, addUserData);
  }

  async function addNewEmailUser(result) {
    console.log(4, result.email);
    console.log(5, result.username);
    try {
      // Constructing the user data to be saved in Firestore
      const userData = {
        username: result.username,
        id: result.userId,
        email: result.email,
        photoURL: "",
        loggedIn: true,
        firstName: result.firstName,
        lastName: result.lastName,
        age: result.age,
        sex: result.sex,
        phobia: result.phobia,
        registered: true,
        admin: false,
        // Add any other relevant user details here
      };

      // Reference to the user's document in Firestore
      // Assuming you have a 'users' collection in Firestore
      const userDocRef = doc(db, "users", result.userId);

      // Adding the user data to Firestore
      await setDoc(userDocRef, userData);

      console.log("User added to Firestore:", userData);
      // You can perform additional actions here, like redirecting the user
    } catch (error) {
      console.error("Error adding user to Firestore:", error);
      // Handle any errors here, like updating the UI to inform the user
    }
  }

  // Function to handle Google sign-in
  const googleSignIn = async () => {
    setLoadingAuthState(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const userData = getAdditionalUserInfo(result);
      // Check if the user is signing in for the first time
      if (userData && userData.isNewUser) {
        console.log("new user", result);
        setIsNewGoogleUser(true);
        addNewGoogleUser(result);
      }

      setTimeout(() => {
        setLoadingAuthState(false);
      }, 2000); // 1000 milliseconds delay
      if (userData.isNewUser) {
        navigate("/details");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.log("error");
      console.log(error.message);
    }
  };

  const logout = async () => {
    // Show a confirmation dialog
    const confirmLogout = window.confirm("Are you sure you want to log out?");

    if (confirmLogout) {
      setLoadingAuthState(true);
      try {
        await signOut(auth); // Sign out the user
        setTimeout(() => {
          setLoadingAuthState(false);
        }, 1000); // Delay for better user experience
        // navigate("/signup"); // Navigate to login or another appropriate route after logout
      } catch (error) {
        console.error("Error signing out: ", error);
      }
      navigate("/");
    } else {
      // User clicked 'Cancel', so do nothing
      console.log("Logout canceled");
    }
  };
  const emailSignUp = async (userDetails) => {
    // Check if email already exists in Firestore
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(
      query(usersRef, where("email", "==", userDetails.email))
    );

    if (!querySnapshot.empty) {
      // Handle case where email already exists
      console.error("Email already in exists.");
      return;
    }
    createUserWithEmailAndPassword(
      auth,
      userDetails.email,
      userDetails.password
    )
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        const userId = user.uid;

        // You can now use the userId for further operations, like adding the user to your database
        console.log(3);
        const data = {
          ...userDetails,
          userId: userId,
        };
        addNewEmailUser(data);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });
  };

  const emailSignIn = async (email, password) => {
    console.log("signing in");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Signed in
      const user = userCredential.user;

      // ... other logic here
    } catch (error) {
      console.error("Error during sign-in:", error);
      // Re-throw the error to be caught by the caller
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        setLoadingAuthState(true);
        if (authUser) {
          setUser(authUser);
          const userDocRef = doc(db, "users", authUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            // Set the user data from Firestore
            setCurrentUser(userDoc.data());
          } else {
            // User is authenticated but not in Firestore (should handle this case)
            setCurrentUser(null);
          }
        } else {
          // No user is signed in
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Error during authentication state change:", err);
      } finally {
        setTimeout(() => {
          setLoadingAuthState(false);
        }, 100); // 1000 milliseconds delay
      }
    });

    return () => unsubscribe();
  }, []);

  const updateUser = async (updatedUserDetails) => {
    if (!user) {
      console.error("No user is signed in");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, updatedUserDetails, { merge: true });
      console.log("User updated successfully");
    } catch (error) {
      console.error("Error updating user: ", error);
    }
  };
  // Context value to be provided to the children components
  const fetchUserAssignments = async (userId) => {
    try {
      // Check if userId is provided
      if (!userId) {
        throw new Error("UserId is required to fetch assignments");
      }

      // Get a reference to the user's assignments subcollection
      const assignmentsRef = collection(db, "users", userId, "assignments");

      // Fetch the documents from the subcollection
      const querySnapshot = await getDocs(assignmentsRef);
      const assignments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return assignments;
    } catch (error) {
      console.error("Error fetching assignments:", error);
      throw error; // Re-throw the error to be handled by the caller
    }
  };
  const values = {
    user,
    currentUser,
    loadingAuthState,
    setLoadingAuthState,
    googleSignIn,
    logout,
    emailSignUp,
    emailSignIn,
    // isNewGoogleUser,
    // setIsNewGoogleUser,
    updateUser,
    fetchUserAssignments,
    // details,
  };

  // Provider component wrapping children with the user context
  return <UserContext.Provider value={values}>{children}</UserContext.Provider>;
};
