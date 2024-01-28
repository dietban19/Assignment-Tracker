import React, { useEffect, useState } from "react";
import {
  doc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../../config/firebase";

import "./dbCalendar.scss";
import DashboardCalendarPopup from "./DashboardCalendarPopup";
import { useUserContext } from "../../../../context/userContext";
const DashboardCalendar = () => {
  const { currentUser } = useUserContext();
  // this card is an over view of the tasks/assignments this week. sort of like week view in google calendar
  const [today, setToday] = useState(new Date());
  const [monthYearRange, setMonthYearRange] = useState("");
  const [weekDates, setWeekDates] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Fetch tasks when the component mounts or weekDates changes
    const fetchTasks = async () => {
      try {
        const userDocRef = doc(db, "users", currentUser && currentUser.id);
        const tasksCollectionRef = collection(userDocRef, "tasks");

        const startOfWeek = weekDates[0].toISOString();
        const endOfWeek = weekDates[6].toISOString();
        console.log(weekDates[0]);
        // Assuming tasks have a 'startDate' field in ISO string format
        const q = query(
          tasksCollectionRef,
          where("startDate", ">=", weekDates[0]),
          where("startDate", "<=", weekDates[6])
        );

        const querySnapshot = await getDocs(q);
        // console.log(querySnapshot);
        const fetchedTasks = [];
        querySnapshot.forEach((doc) => {
          fetchedTasks.push({ id: doc.id, ...doc.data() });
        });

        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    if (currentUser && weekDates.length === 7) {
      console.log("sdf");
      fetchTasks();
    }
  }, [currentUser, weekDates]);

  // Utility function to format month and year
  const formatMonthYear = (date) => {
    const options = { month: "short", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };
  const getWeekDates = (date) => {
    const startOfWeek = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - date.getDay()
    );
    return Array.from({ length: 7 }).map((_, index) => {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + index);
      return day;
    });
  };

  // Utility function to get month and year range
  const getMonthYearRange = (date) => {
    const startOfWeek = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - date.getDay()
    );
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    // Check if start and end of the week are in different months or years
    if (
      startOfWeek.getMonth() !== endOfWeek.getMonth() ||
      startOfWeek.getFullYear() !== endOfWeek.getFullYear()
    ) {
      return `${formatMonthYear(startOfWeek)} - ${formatMonthYear(endOfWeek)}`;
    }
    return formatMonthYear(startOfWeek);
  };

  useEffect(() => {
    // Set the month and year range when the component mounts or the 'today' state changes
    setMonthYearRange(getMonthYearRange(today));
    setWeekDates(getWeekDates(today));
  }, [today]);

  // Handler for next week
  const handleNextWeek = () => {
    setToday(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
    );
  };

  // Handler for previous week
  const handlePrevWeek = () => {
    setToday(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)
    );
  };

  const getHoursInDay = () => {
    return Array.from({ length: 24 }).map((_, index) => {
      const label =
        index < 12
          ? `${index === 0 ? 12 : index} AM`
          : `${index === 12 ? index : index - 12} PM`;
      return { label, value: index };
    });
  };

  const getDayAbbreviation = (date) => {
    // Use the toLocaleDateString method to get the day name abbreviation
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };
  const renderWeekDates = weekDates.map((date, index) => {
    // You can customize the content for each day here
    // For example, you can display the date number and day name
    return (
      <div className="db-calendar-date" key={index}>
        <span className="date-number">{date.getDate()}</span>
        <div className="date-day">{getDayAbbreviation(date)}</div>
      </div>
    );
  });
  const getFormattedHours = () => {
    const times = [];
    for (let i = 0; i < 24; i++) {
      // Convert 24-hour time to 12-hour format
      const hour = i % 12 === 0 ? 12 : i % 12; // Convert 0 to 12 for 12 AM
      const suffix = i < 12 ? "AM" : "PM";
      times.push(`${hour} ${suffix}`);
    }
    return times;
  };

  const parseFormattedTime = (formattedTime) => {
    const [hour12, period] = formattedTime.split(" ");
    let hour24 = parseInt(hour12, 10);

    // Convert 12-hour format to 24-hour format
    if (period === "PM" && hour24 < 12) {
      hour24 += 12;
    } else if (period === "AM" && hour24 === 12) {
      hour24 = 0;
    }

    return hour24;
  };
  const hours = getFormattedHours();

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [cellPosition, setCellPosition] = useState({ x: 0, y: 0 });
  const [selectedTask, setSelectedTask] = useState(null);
  const handleCellClick = (date, hour, event) => {
    const cell = event.currentTarget;
    const cellRect = cell.getBoundingClientRect();

    const selectedDateTime = new Date(date);

    selectedDateTime.setHours(parseFormattedTime(hour));

    // Identify if a task was clicked
    const clickedTask = tasks.find((task) => {
      const taskDate = new Date(task.startDate.seconds * 1000);
      const parseTime = (date, timeString) => {
        const [hours, minutes] = timeString
          .split(":")
          .map((str) => parseInt(str, 10));
        const newDate = new Date(date);
        newDate.setHours(hours, minutes, 0, 0);
        return newDate;
      };
      const taskStartTime = parseTime(taskDate, task.startTime).getTime();
      const taskEndTime = parseTime(taskDate, task.endTime).getTime();
      return (
        selectedDateTime.getTime() >= taskStartTime &&
        selectedDateTime.getTime() < taskEndTime
      );
    });

    setSelectedDate(selectedDateTime);
    setSelectedTask(clickedTask || null); // Set the clicked task or null
    setCellPosition({
      x: cellRect.left + window.scrollX,
      y: cellRect.top + window.scrollY,
    });
    setIsPopupVisible(true);
  };

  const closePopup = () => {
    setIsPopupVisible(false);
  };

  const renderTasks = (date, hour) => {
    // console.log(tasks);
    const hourStart = new Date(date).setHours(hour, 0, 0, 0);
    const hourEnd = new Date(date).setHours(hour + 1, 0, 0, 0);
    const parseTime = (date, timeString) => {
      const [hours, minutes] = timeString
        .split(":")
        .map((str) => parseInt(str, 10));
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);
      return newDate;
    };

    return tasks
      .filter((task) => {
        const taskDate = new Date(task.startDate.seconds * 1000);
        const taskStartTime = parseTime(taskDate, task.startTime).getTime();
        const taskEndTime = parseTime(taskDate, task.endTime).getTime();

        // Check if the task overlaps with the current hour
        return taskStartTime < hourEnd && taskEndTime > hourStart;
      })

      .map((task) => {
        const taskDate = new Date(task.startDate.seconds * 1000);
        const taskStartTime = parseTime(taskDate, task.startTime).getTime();

        // Check if this hour is the starting hour of the task
        const isStartingHour = hourStart === taskStartTime;

        return (
          <div
            key={task.id}
            className="event-task"
            style={{ backgroundColor: task.color }}
          >
            {/* {isStartingHour ? task.name : ""}{" "} */}
            {task.name}
            {/* Display task name only for the starting hour */}
          </div>
        );
      });
  };

  return (
    <div className="dashboard-calendar-container">
      <div className="switch-months flex">
        <button className="arrow" onClick={handlePrevWeek}>
          {"<"}
        </button>
        <button className="arrow" onClick={handleNextWeek}>
          {">"}
        </button>
        <div className="month-name HeaderTwo">{monthYearRange}</div>
      </div>
      <div className="db-calendar-container">
        <div className="db-calendar-header flex">
          <div className="aside-time"></div>
          {renderWeekDates}
        </div>
        <div className="db-calendar-body">
          {hours.map((hour, hourIndex) => (
            <div className="time-row" key={hourIndex}>
              <span className="hour-label">{hour}</span>
              {weekDates.map((date, dateIndex) => (
                <span
                  key={dateIndex}
                  className="db-calendar-cell"
                  onClick={(e) => handleCellClick(date, hour, e)}
                >
                  {/* <div className="event-task"> */}
                  {renderTasks(date, hourIndex)}
                  {/* </div> */}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      {isPopupVisible && (
        <DashboardCalendarPopup
          selectedDate={selectedDate}
          task={selectedTask} // Add this line
          position={cellPosition}
          onClose={closePopup}
        />
      )}
    </div>
  );
};

export default DashboardCalendar;
