import React, { useState, useEffect, useRef } from "react";
import { useUserContext } from "../../context/userContext";
import {
  doc,
  getDocs,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import "./DashboardComponents.scss";
import { IoMdClose } from "react-icons/io";
const AssignmentPopup = ({ onClose, selectedAssignment }) => {
  const { currentUser } = useUserContext();
  const [showCategoryOptions, setShowCategoryOptions] = useState(false);
  const [chosenColor, setChosenColor] = useState("");
  const today = new Date();
  // Format today's date as a string in the format YYYY-MM-DD
  const formattedToday = today.toISOString().split("T")[0];

  // Get tomorrow's date by adding one day to today
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  // Format tomorrow's date as a string in the format YYYY-MM-DD
  const formattedTomorrow = tomorrow.toISOString().split("T")[0];
  const [assignment, setAssignment] = useState({
    name: "",
    // description: "",
    subject: "",
    status: "Not Started", // Set default status
    startDate: formattedToday,
    dueDate: formattedTomorrow,
    startTime: "08:00",
    endTime: "09:00",
    color: "#ffffff", // Default color value
    category: "",
    userId: currentUser && currentUser.id,
  });

  const [categories, setCategories] = useState([]); // State to hold fetched categories
  const [subjects, setSubjects] = useState([]); // State to hold fetched subjects
  const [colors, setColors] = useState([]); // State to hold fetched
  const [showSubjectOptions, setShowSubjectOptions] = useState(false);
  // Function to fetch categories from Firebase
  const fetchCategories = async () => {
    try {
      const userDocRef = doc(db, "users", currentUser && currentUser.id);
      const assignmentsCollectionRef = collection(userDocRef, "assignments");
      const querySnapshot = await getDocs(assignmentsCollectionRef);
      const fetchedCategories = [];
      querySnapshot.forEach((doc) => {
        fetchedCategories.push(doc.data().category);
      });
      setCategories([...new Set(fetchedCategories)]); // Remove duplicates
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  const fetchSubjects = async () => {
    try {
      const userDocRef = doc(db, "users", currentUser && currentUser.id);
      const assignmentsCollectionRef = collection(userDocRef, "assignments");
      const querySnapshot = await getDocs(assignmentsCollectionRef);
      const fetchedCategories = [];
      querySnapshot.forEach((doc) => {
        fetchedCategories.push(doc.data().subject);
      });
      setSubjects([...new Set(fetchedCategories)]); // Remove duplicates
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };
  const fetchColors = async () => {
    try {
      const userDocRef = doc(db, "users", currentUser && currentUser.id);
      const assignmentsCollectionRef = collection(userDocRef, "assignments");
      const querySnapshot = await getDocs(assignmentsCollectionRef);
      const fetchedColors = [];
      querySnapshot.forEach((doc) => {
        fetchedColors.push(doc.data().color);
      });
      setColors([...new Set(fetchedColors)]); // Remove duplicates
    } catch (error) {
      console.error("Error fetching colors:", error);
    }
  };
  console.log(colors);
  const statusOptions = ["In Progress", "Not Started", "Done"];

  useEffect(() => {
    fetchCategories();
    fetchSubjects();
    fetchColors();

    if (selectedAssignment) {
      setAssignment({
        name: selectedAssignment.name,
        subject: selectedAssignment.subject,
        status: selectedAssignment.status,
        startDate: selectedAssignment.startDate,
        dueDate: selectedAssignment.dueDate,
        startTime: selectedAssignment.startTime,
        endTime: selectedAssignment.endTime,
        userId: currentUser && currentUser.id,
      });
    }
  }, [selectedAssignment, currentUser]);
  const handleInputChange = (e) => {
    setAssignment({ ...assignment, [e.target.name]: e.target.value });
  };
  async function saveAssignment() {
    try {
      // Reference to the user document
      const userDocRef = doc(db, "users", currentUser && currentUser.id);
      // Reference to the 'assignments' subcollection
      const assignmentsCollectionRef = collection(userDocRef, "assignments");

      if (selectedAssignment) {
        // Updating an existing assignment
        const assignmentDocRef = doc(
          assignmentsCollectionRef,
          selectedAssignment.id
        );
        await updateDoc(assignmentDocRef, assignment);
        console.log("Assignment updated with ID:", assignment.id);
      } else {
        // Adding a new assignment
        const assignmentDocRef = await addDoc(
          assignmentsCollectionRef,
          assignment
        );
        console.log("Assignment added with ID:", assignmentDocRef.id);
      }
    } catch (error) {
      console.error("Error saving assignment:", error);
    }
  }
  async function addAssignmentToUser() {
    try {
      // Get a reference to the user document
      const userDocRef = doc(db, "users", currentUser && currentUser.id);

      // Reference the 'assignments' subcollection of this user
      const assignmentsCollectionRef = collection(userDocRef, "assignments");

      // Add a new document to the 'assignments' subcollection
      const assignmentDocRef = await addDoc(
        assignmentsCollectionRef,
        assignment
      );

      console.log("Assignment added with ID:", assignmentDocRef.id);
    } catch (error) {
      console.error("Error adding assignment:", error);
    }
  }
  async function deleteAssignment() {
    if (!selectedAssignment) {
      console.error("No assignment selected for deletion.");
      return;
    }
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this assignment?"
    );
    if (!isConfirmed) {
      return; // Exit the function if the user cancels the action
    }

    try {
      const userDocRef = doc(db, "users", currentUser && currentUser.id);
      const assignmentsCollectionRef = collection(userDocRef, "assignments");
      const assignmentDocRef = doc(
        assignmentsCollectionRef,
        selectedAssignment.id
      );

      await deleteDoc(assignmentDocRef);
      console.log("Assignment deleted with ID:", selectedAssignment.id);
      onClose(); // Close the popup and possibly refresh the list
    } catch (error) {
      console.error("Error deleting assignment:", error);
    }
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    saveAssignment().then(() => {
      onClose(); // Assuming onClose will trigger a refetch in Dashboard
    });
  };

  function clearPlaceholder() {
    var dateInput = document.getElementById("dateInput");
    if (dateInput.value === "yyyy-mm-dd") {
      dateInput.value = "";
    }
  }
  console.log(categories);
  const handleCategorySelect = (category) => {
    setAssignment({ ...assignment, category: category });
    setShowCategoryOptions(false); // Hide category options after selection
  };
  const handleShowCategoryOptions = () => {
    setShowCategoryOptions(true); // Show category options
  };
  const handleSubjectSelect = (subject) => {
    setAssignment({ ...assignment, subject: subject });
    setShowSubjectOptions(false); // Hide subject options after selection
  };

  const categoryOptionsRef = useRef(null);
  const subjectOptionsRef = useRef(null);

  // Function to hide options when clicking outside
  const handleClickOutside = (event) => {
    if (
      categoryOptionsRef.current &&
      !categoryOptionsRef.current.contains(event.target)
    ) {
      setShowCategoryOptions(false);
    }
    if (
      subjectOptionsRef.current &&
      !subjectOptionsRef.current.contains(event.target)
    ) {
      setShowSubjectOptions(false);
    }
  };

  // Attach the event listener
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Cleanup the event listener
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleChangeColor(color) {
    setChosenColor(color);
    setAssignment({ ...assignment, color: color });
  }
  return (
    <div className="popup-wrapper">
      <div className="assignment-popup">
        <div className="close-container">
          <button
            className="close-popup center"
            type="button"
            onClick={onClose}
          >
            <IoMdClose />
          </button>
        </div>
        {/* <h1>Assignment Details</h1> */}
        <form onSubmit={handleSubmit}>
          <div className="assignment-title-container">
            {" "}
            <input
              type="text"
              name="name"
              placeholder="Assignment Name"
              className="assignment-title"
              value={assignment.name}
              onChange={handleInputChange}
              required
            />
            <div className="assignment-color">
              <div style={{ backgroundColor: chosenColor }}></div>
            </div>
          </div>
          <div className="first-assignment-details flex">
            {" "}
            <div className="subject-cont input-container ">
              <input
                type="text"
                name="subject"
                className="input-content-container"
                value={assignment.subject}
                onChange={handleInputChange}
                required
                autoComplete="off"
                onClick={() => setShowSubjectOptions(true)} // Show options when input is clicked
              />
              <div className="label-line">Subject</div>
              {showSubjectOptions && (
                <div className="subject-options" ref={subjectOptionsRef}>
                  {subjects.map((subject, index) => (
                    <span
                      key={index}
                      onClick={() => handleSubjectSelect(subject)}
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="category-cont input-container ">
              {" "}
              <input
                type="text"
                name="category"
                // placeholder="Category"
                autoComplete="off"
                onClick={handleShowCategoryOptions} // Show options when input is clicked
                className="input-content-container"
                value={assignment.category}
                onChange={handleInputChange}
                required
              />
              <div className="label-line">Category</div>
              {showCategoryOptions && (
                <div className="category-options" ref={categoryOptionsRef}>
                  {categories.map((category, index) => (
                    <span
                      key={index}
                      onClick={() => handleCategorySelect(category)}
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="select-container">
              {" "}
              <div className="label-line">Status</div>
              <select
                name="status"
                className="select-content-container"
                placeholder="status"
                value={assignment.status}
                onChange={handleInputChange}
                required
              >
                {statusOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="dates-container">
            <div className="input-container">
              <input
                type="date"
                name="startDate"
                className="date-content-container"
                value={assignment.startDate}
                placeholder=""
                onChange={handleInputChange}
                required
              />
              <div className="label-line">Start Date</div>
            </div>
            <div className="input-container">
              <input
                type="date"
                name="dueDate"
                placeholder=""
                className="date-content-container"
                value={assignment.dueDate}
                onChange={handleInputChange}
                required
              />
              <div className="label-line">Due Date</div>
            </div>
            <div className="input-container">
              <input
                type="time"
                name="startTime"
                className="date-content-container"
                value={assignment.startTime}
                placeholder=""
                onChange={handleInputChange}
                required
              />
              <div className="label-line">Start Time</div>
            </div>
            <div className="input-container">
              <input
                type="time"
                name="endTime"
                className="date-content-container"
                value={assignment.endTime}
                placeholder=""
                onChange={handleInputChange}
                required
              />
              <div className="label-line">End Time</div>
            </div>
          </div>

          <div className="category-container">
            {" "}
            <div className="category-color-container">
              <span>Assignment Color</span>
              <div className="recommend-color flex">
                {colors.slice(0, 5).map((color, index) => (
                  <div
                    key={index}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      handleChangeColor(color);
                    }}
                  >
                    {/* {color} */}
                  </div>
                ))}
              </div>
              <div className="color-picker-container">
                <input
                  type="color"
                  name="color"
                  value={assignment.color}
                  onChange={handleInputChange}
                />
                <span className="plus-sign">+</span>
              </div>
            </div>
          </div>
          <div className="popup-btn-containers flexCol gapOne">
            {" "}
            {selectedAssignment ? (
              <>
                {" "}
                <button className="update normal-btn center btn" type="submit">
                  Update
                </button>
                <button
                  className="delete normal-btn center btn"
                  onClick={deleteAssignment} // Add onClick handler for delete
                >
                  Delete
                </button>
              </>
            ) : (
              <button className="submit normal-btn center btn" type="submit">
                Save
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentPopup;
