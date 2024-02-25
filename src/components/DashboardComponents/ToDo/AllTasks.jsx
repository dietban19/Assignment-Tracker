import React, { useState, useEffect } from 'react';
import { FaCheck } from 'react-icons/fa';
import { db } from '../../../config/firebase'; // Ensure this path matches your Firebase config file
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { useUserContext } from '../../../context/userContext'; // Adjust this import to match where your context is defined
const AllTasks = ({ tasks }) => {
  const { currentUser } = useUserContext(); // Get current user from context
  const [today, setToday] = useState(new Date());

  const sortedTasks = tasks.sort((a, b) => a.date.localeCompare(b.date));
  const toggleTaskCompletion = async (taskId) => {
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) return; // Task not found

    const task = tasks[taskIndex];
    const updatedTask = { ...task, completed: !task.completed };
    const updatedTasks = [
      ...tasks.slice(0, taskIndex),
      updatedTask,
      ...tasks.slice(taskIndex + 1),
    ];

    // Update local state
    setTasks(updatedTasks);

    // Update in Firestore
    const taskRef = doc(db, 'users', currentUser.id, 'todo', taskId);
    try {
      await updateDoc(taskRef, {
        completed: updatedTask.completed,
      });
      console.log(
        `Task ${taskId} completion status updated to ${updatedTask.completed}`,
      );
    } catch (error) {
      console.error('Error updating task completion status: ', error);
      // Optionally, revert the local state update if Firestore update fails
      setTasks(tasks); // Or handle this more gracefully
    }
  };
  const todayDate = today.toISOString().split('T')[0];
  const [filter, setFilter] = useState('All');
  return (
    <div className="flex h-full flex-col">
      <div className="text-2xl font-semibold">All Tasks</div>
      <div className=" p-2- mt-4  flex items-center">
        <div
          id="all-tasks-filter"
          onClick={() => setFilter('All')}
          className={`flex cursor-pointer items-center px-4 text-xl ${filter == 'All' ? 'border-r-4 border-apple-blue font-semibold text-apple-blue dark:border-apple-blue-light dark:text-apple-blue-light' : 'text-dark-500 '}`}
        >
          All
        </div>
        <div
          id="all-tasks-filter"
          onClick={() => setFilter('Completed')}
          className={`flex cursor-pointer items-center px-4 text-xl ${filter == 'Completed' ? 'border-l-4 border-r-4 border-apple-blue font-semibold text-apple-blue dark:border-apple-blue-light dark:text-apple-blue-light' : 'text-gray-400'}`}
        >
          Completed
        </div>
        <div
          id="all-tasks-filter"
          onClick={() => setFilter('Incomplete')}
          className={`flex cursor-pointer items-center px-4 text-xl ${filter == 'Incomplete' ? 'border-l-4 border-apple-blue font-semibold text-apple-blue dark:border-apple-blue-light dark:text-apple-blue-light' : 'text-gray-400'}`}
        >
          Incomplete
        </div>
      </div>
      <div
        id="all-tasks-list"
        className="mt-4 flex h-full flex-col gap-2 overflow-y-scroll"
      >
        {sortedTasks
          .filter((task) => {
            if (filter === 'Completed') return task.completed;
            if (filter === 'Incomplete') return !task.completed;
            return true;
          })
          .map((task) => (
            <div
              key={task.id}
              className="flex flex-col rounded-2xl bg-white  px-12 py-3 dark:bg-dark-500"
            >
              <div
                id="task-top"
                className="flex items-center justify-between border-b-2 py-2 pb-4"
              >
                <h2 className="text-xl font-medium">{task.name}</h2>
                <div
                  onClick={() => toggleTaskCompletion(task.id)}
                  className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full ${task.completed ? 'bg-green-500' : 'bg-gray-200'} transition-colors duration-200`}
                >
                  {task.completed && <FaCheck color="white" />}
                </div>
              </div>
              <div className="py-2">
                <p className="text-lg text-light-400 dark:text-dark-800">
                  {task.date == todayDate ? <>Today</> : <>Date: {task.date}</>}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AllTasks;
