import React, { createContext, useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
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

// Create a context for managing Assigments information
export const AssigmentsContext = React.createContext();

const provider = new GoogleAuthProvider();

// Custom hook to access the AssigmentsContext
export function useAssigmentsContext() {
  return useContext(AssigmentsContext);
}

// Provider component to wrap the application and provide Assigments context
export const AssigmentsProvider = ({ children }) => {
  const values = {};

  // Provider component wrapping children with the Assigments context
  return (
    <AssigmentsContext.Provider value={values}>
      {children}
    </AssigmentsContext.Provider>
  );
};
