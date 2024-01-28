import React, { useState, useEffect, useRef } from 'react';
import { useUserContext } from '../../../context/userContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { IoIosArrowForward } from 'react-icons/io';
import { auth, db } from '../../../config/firebase';
import { useNavigate } from 'react-router-dom';
import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
const TodaysTasks = () => {
  const { currentUser, fetchUserAssignments } = useUserContext();
  const [assignments, setAssignments] = useState([]); // State to store assignments
  const [dayRange, setDayRange] = useState('NextThree');
  const scrollableListRef = useRef(null);
  const startOfDayLocal = (dateString) => {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    date.setTime(date.getTime() - userTimezoneOffset);
    date.setHours(24, 0, 0, 0);
    return date;
  };
  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(assignments);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setAssignments(items);
  };
  ``;
  useEffect(() => {
    console.log('123');
    const handleScroll = (event) => {
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      // Check if the scroll is at the top or the bottom
      if (scrollTop === 0 || scrollTop + clientHeight === scrollHeight) {
        event.preventDefault();
      }
    };

    // Add event listener
    const listEl = scrollableListRef.current;
    if (listEl) {
      listEl.addEventListener('scroll', handleScroll, { passive: false });
    }

    // Remove event listener on cleanup
    return () => {
      if (listEl) {
        listEl.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    if (currentUser?.id) {
      fetchUserAssignments(currentUser.id)
        .then((fetchedAssignments) => {
          const sortedAssignments = fetchedAssignments.sort((a, b) => {
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);
            return dateA - dateB; // Ascending order
          });
          const todaysAssignments = sortedAssignments.filter((assignment) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of the day
            const dueDate = new Date(assignment.dueDate + 'T00:00:00');
            return dueDate.getTime() === today.getTime();
          });

          // Filter assignments for the next three days
          const threeDays = sortedAssignments.filter((assignment) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of the day to include whole day

            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1); // Set to tomorrow to exclude today

            const sevenDaysFromToday = new Date(today);
            sevenDaysFromToday.setDate(sevenDaysFromToday.getDate() + 9); // 7 days from today

            const dueDate = new Date(assignment.dueDate + 'T00:00:00');

            // Check if dueDate is between tomorrow and 7 days from today
            return dueDate >= tomorrow && dueDate < sevenDaysFromToday;
          });

          // console.log(dayRange)
          setAssignments(
            dayRange == 'NextThree' ? threeDays : todaysAssignments,
          );
        })
        .catch((error) => {
          console.error('Error fetching assignments: ', error);
        });
    }
  }, [currentUser, dayRange]);

  const updateAssignmentStatusInDatabase = async (assignmentId, status) => {
    // Assuming you have a function to get a reference to the assignment document
    const assignmentDocRef = doc(
      db,
      'users',
      currentUser.id,
      'assignments',
      assignmentId,
    );

    // Update the document
    await updateDoc(assignmentDocRef, { status: status });
  };
  const handleCheckboxChange = (assignmentId, currentStatus) => {
    const newStatus = currentStatus === 'Done' ? 'In Progress' : 'Done';

    // Update the state
    const updatedAssignments = assignments.map((assignment) => {
      if (assignment.id === assignmentId) {
        return { ...assignment, status: newStatus };
      }
      return assignment;
    });

    setAssignments(updatedAssignments);

    // Update the database
    updateAssignmentStatusInDatabase(assignmentId, newStatus);
  };

  return (
    <div className="todays-tasks_container">
      <div className="gap flex">
        <div
          onClick={() => {
            setDayRange('today');
          }}
          className={`cursor-pointer p-2 text-lg ${dayRange == 'today' ? 'dark:text-light-300 dark:border-light-300 border-b-2 border-black font-semibold text-black' : 'border-b-1 dark:text-dark-900 dark:border-dark-900 text-gray-300'}`}
        >
          Due Today
        </div>
        <div
          onClick={() => {
            setDayRange('NextThree');
          }}
          className={`cursor-pointer p-2 text-lg ${dayRange == 'NextThree' ? 'dark:text-light-300 dark:border-light-300 border-b-2 border-black font-semibold text-black' : 'border-b-1 dark:text-dark-900 dark:border-dark-900 text-gray-300'}`}
        >
          Due Next Seven Days
        </div>
      </div>

      <ul ref={scrollableListRef}>
        {assignments.map((assignment) => (
          <li className="assignment-list-item flex" key={assignment.id}>
            <div className="assignment-left">
              <div className="assignment-checkmark-container">
                <label className="checkmark-container">
                  <input
                    type="checkbox"
                    checked={assignment.status === 'Done'}
                    onChange={() =>
                      handleCheckboxChange(assignment.id, assignment.status)
                    }
                  />
                  <span className="checkmark border-1 dark:border-light-400 border-black"></span>
                </label>
              </div>
              <div className="assignment-detail">
                <span className="assignment-left-title dark:text-light-400 text-black">
                  {assignment.name}
                </span>
                <div className="today-task-category flex">
                  <span
                    className="today-task-cat-color"
                    style={{ backgroundColor: assignment.color }} // Corrected style prop
                  ></span>
                  <span>{assignment.dueDate}</span>
                </div>
              </div>
            </div>
            <div className="assignment-right">
              <IoIosArrowForward />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodaysTasks;
