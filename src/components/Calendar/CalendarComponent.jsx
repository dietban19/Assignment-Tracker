import React, { useState, useEffect } from 'react';
import './calendar.scss';
import {
  doc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

//   import DashboardCalendarPopup from "./DashboardCalendarPopup";
import { useUserContext } from '../../context/userContext';
const CalendarComponent = () => {
  const { currentUser } = useUserContext();
  const [today, setToday] = useState(new Date());
  const [monthYearRange, setMonthYearRange] = useState('');
  const [weekDates, setWeekDates] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {

    // Fetch tasks when the component mounts or weekDates changes
    const fetchTasks = async () => {
      try {
        const userDocRef = doc(db, 'users', currentUser && currentUser.id);
        const tasksCollectionRef = collection(userDocRef, 'tasks');

        const startOfWeek = weekDates[0].toISOString();
        const endOfWeek = weekDates[6].toISOString();

        // Assuming tasks have a 'startDate' field in ISO string format
        const q = query(
          tasksCollectionRef,
          where('startDate', '>=', weekDates[0]),
          where('startDate', '<=', weekDates[6]),
        );

        const querySnapshot = await getDocs(q);
        // console.log(querySnapshot);
        const fetchedTasks = [];
        querySnapshot.forEach((doc) => {
          fetchedTasks.push({ id: doc.id, ...doc.data() });
        });

        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    if (currentUser && weekDates.length === 7) {
      fetchTasks();
    }
  }, [currentUser, weekDates]);
  // Utility function to get month and year range
  const getWeekDates = (date) => {
    const startOfWeek = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - date.getDay(),
    );
    return Array.from({ length: 7 }).map((_, index) => {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + index);
      return day;
    });
  };
  const getMonthYearRange = (date) => {
    const startOfWeek = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - date.getDay(),
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
  const formatMonthYear = (date) => {
    const options = { month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    // Set the month and year range when the component mounts or the 'today' state changes
    setMonthYearRange(getMonthYearRange(today));
    setWeekDates(getWeekDates(today));
  }, [today]);

  const handleNextWeek = () => {
    setToday(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
    );
  };

  // Handler for previous week
  const handlePrevWeek = () => {
    setToday(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
    );
  };
  const getDayAbbreviation = (date) => {
    // Use the toLocaleDateString method to get the day name abbreviation
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  const renderWeekDates = weekDates.map((date, index) => {
    // You can customize the content for each day here
    // For example, you can display the date number and day name
    return (
      <div className="db-calendar-date " key={index}>
        <div className="date-day">{getDayAbbreviation(date)}</div>
        <span className="date-number">{date.getDate()}</span>
      </div>
    );
  });
  const hours = Array.from({ length: 24 }, (_, index) => {
    // Convert 24-hour format to 12-hour format
    const hour = index % 12 === 0 ? 12 : index % 12;
    // Determine whether it's AM or PM
    const amPm = index < 12 ? 'AM' : 'PM';
    return `${hour}${amPm}`;
  });
  const renderHourLabels = () => {
    return hours.map((hour, index) => (
      <div
        key={index}
        className={`hour-number ${hour === '12AM' ? 'blue-hour' : ''}`}
      >
        <span>{hour}</span>
      </div>
    ));
  };

  // Determine the number of rows and columns for the days container
  const numRows = 7; // For example, 7 days a week
  const numCols = 24; // 24 hours

  // Generate day containers dynamically
  const renderDayContainers = () => {
    let dayContainers = [];
    for (let row = 0; row < numRows; row++) {
      let week = [];
      for (let col = 0; col < numCols; col++) {
        week.push(<div key={`${row}-${col}`} className="hour-container"></div>);
      }
      dayContainers.push(
        <div key={row} className="days-container">
          {week}
        </div>,
      );
    }
    return dayContainers;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="change-month-btn">
          {' '}
          <button className="arrow" onClick={handlePrevWeek}>
            {'<'}
          </button>
          <button className="arrow" onClick={handleNextWeek}>
            {'>'}
          </button>
        </div>

        <span> {monthYearRange}</span>
      </div>
      <div className="calendar-main-container">
        <div className="calendar-date-header">
          <div className="calendar-aside"></div>
          {renderWeekDates}
        </div>
        <div className="calendar-body">
          <div className="hour-container flexColCenter">
            {renderHourLabels()}
          </div>
          <div className="main-days-container">{renderDayContainers()}</div>
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;
