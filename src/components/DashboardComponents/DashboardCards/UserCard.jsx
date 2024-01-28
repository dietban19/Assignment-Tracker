import React, { useState, useEffect } from 'react';
import { db } from '../../../config/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { useUserContext } from '../../../context/userContext';
import './DashboardCards.scss';
const UserCard = () => {
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  useEffect(() => {
    const fetchUpcomingTasks = async () => {
      try {
        // Convert current date to Firestore timestamp format
        const now = new Date();
        const nowTimestamp = Math.floor(now.getTime() / 1000);
        console.log(nowTimestamp);
        const tasksCollectionRef = collection(db, 'tasks'); // Replace 'tasks' with your actual collection name
        const q = query(
          tasksCollectionRef,
          where('startDate.seconds', '>=', nowTimestamp),
          orderBy('startDate.seconds'),
          limit(3),
        );

        const querySnapshot = await getDocs(q);
        const tasks = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUpcomingTasks(tasks);
      } catch (error) {
        console.error('Error fetching upcoming tasks:', error);
      }
    };

    fetchUpcomingTasks();
  }, []);

  const formatTaskDateTime = (timestampSeconds, timeString) => {
    const date = new Date(timestampSeconds * 1000);
    // Format the date as needed, here it's in a simple 'Day, Date' format
    return `${date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })} at ${timeString}`;
  };

  return (
    <div className="UserCard">
      <div className="user-card-header flexCol">
        <span>Hello,</span>
        <span>Dieter Banaag</span>
      </div>
      <div className="user-card-right dark:bg-dark-500 bg-light-300">
        <div className="upcoming-tasks-header ">Upcoming Tasks</div>
        <div className="upcoming-tasks-container">
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map((task) => (
              <div key={task.id} className="upcoming-task">
                <span
                  className="task-color"
                  style={{ backgroundColor: task.color }}
                ></span>
                <div className="upcoming-task-detail">
                  <div className="upcoming-task-header">{task.name}</div>
                  <div className="upcoming-task-time">
                    {/* Format task.dueDate to display day */}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>No upcoming tasks</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
