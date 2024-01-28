import React, { useState, useEffect } from "react";
import { db } from "../../../../config/firebase";
import { doc, collection, addDoc, updateDoc } from "firebase/firestore";
import { useUserContext } from "../../../../context/userContext";
import { IoMdClose } from "react-icons/io";
const DashboardCalendarPopup = ({
  selectedDate,
  position,
  onClose,
  task: initialTask,
}) => {
  const { currentUser } = useUserContext();
  const parseDate = new Date(selectedDate);

  const startTime = parseDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  parseDate.setHours(parseDate.getHours() + 1); // Add one hour for the end time
  const endTime = parseDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const [task, setTask] = useState({
    name: initialTask?.name || "", // Use existing task name or empty string
    startDate: initialTask?.startDate || selectedDate, // Use existing start date or new selected date
    startTime: initialTask?.startTime || startTime, // Use existing start time or calculate new start time
    endTime: initialTask?.endTime || endTime, // Use existing end time or calculate new end time
    color: "",
  });
  useEffect(() => {
    if (initialTask) {
      setTask({
        name: initialTask.name,
        startDate: initialTask.startDate,
        startTime: initialTask.startTime,
        endTime: initialTask.endTime,
      });
    }
  }, [initialTask]);

  const [validationMessage, setValidationMessage] = useState("");

  // Function to check if endTime is after startTime
  const isEndTimeValid = (startTime, endTime) => {
    const [startHour, startMinutes] = startTime.split(":").map(Number);
    const [endHour, endMinutes] = endTime.split(":").map(Number);
    const startDate = new Date(0, 0, 0, startHour, startMinutes);
    const endDate = new Date(0, 0, 0, endHour, endMinutes);
    return endDate > startDate;
  };
  const handleChange = (e) => {
    const updatedTask = { ...task, [e.target.name]: e.target.value };
    if (e.target.name === "startTime" || e.target.name === "endTime") {
      if (!isEndTimeValid(updatedTask.startTime, updatedTask.endTime)) {
        setValidationMessage("End time must be after start time.");
      } else {
        setValidationMessage(""); // Clear message if times are valid
      }
    }
    setTask(updatedTask);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEndTimeValid(task.startTime, task.endTime)) {
      setValidationMessage("End time must be after start time.");
      return; // Prevent form submission
    }
    try {
      const userDocRef = doc(db, "users", currentUser && currentUser.id);
      const tasksCollectionRef = collection(userDocRef, "tasks");

      if (initialTask) {
        const taskDocRef = doc(tasksCollectionRef, initialTask.id); // You need to have the task ID
        await updateDoc(taskDocRef, task);
        console.log("Task updated with details:", task);
      } else {
        // Add a new task
        await addDoc(tasksCollectionRef, task);
        console.log("Task added with details:", task);
      }

      onClose(); // Close popup after submitting
    } catch (error) {
      console.error("Error handling task:", error);
    }
  };

  const popupStyle = {
    // position: "absolute",
    // left: `${position.x - 85}px`,
    // top: `${position.y}px`,
  };

  const colors = [
    "#ba0d16",
    "#c4494f",
    "#e3801e",
    "#ebc713",
    "#1f8705",
    "#1d1dc4",
    "#1d1dc4",
    "#666666",
    "#32a67f",
  ];
  const handleColorChange = (color) => {
    setTask({ ...task, color });
  };

  return (
    <div className="db-calendar-popup" style={popupStyle}>
      <div className="db-calendar-popup-close">
        <button onClick={onClose}>
          <IoMdClose />
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="task-name-input">
          {/* <label>Task Name:</label> */}
          <input
            type="text"
            name="name"
            value={task.name}
            onChange={handleChange}
            placeholder="Task Name"
            required
          />
        </div>
        <div>
          <label>Start Time:</label>
          <input
            type="time"
            name="startTime"
            value={task.startTime}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>End Time:</label>
          <input
            type="time"
            name="endTime"
            value={task.endTime}
            onChange={handleChange}
            required
          />
        </div>
        {validationMessage && (
          <p className="validation-message">{validationMessage}</p>
        )}

        <div className="color-picker">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              style={{
                backgroundColor: color,
                width: "30px",
                height: "30px",
                margin: "2px",
                border: "none",
                borderRadius: "50%",
              }}
              onClick={() => handleColorChange(color)}
            />
          ))}
        </div>
        <button
          type="submit"
          className="save-task"
          disabled={validationMessage}
        >
          Add Task
        </button>
      </form>
      {/* <button onClick={onClose}>Close</button> */}
    </div>
  );
};
export default DashboardCalendarPopup;
