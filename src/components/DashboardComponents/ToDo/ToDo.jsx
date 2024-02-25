import React, { useEffect, useState } from 'react';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import { FaCheck } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { db } from '../../../config/firebase'; // Adjust path as needed
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
import { useUserContext } from '../../../context/userContext'; // Adjust path as needed
import AllTasks from './AllTasks';

const ToDo = () => {
  const [newTaskName, setNewTaskName] = useState('');
  const [section, setSection] = useState('Daily Tasks');
  const { currentUser } = useUserContext(); // Get current user from context
  const [popup, setPopup] = useState(false);
  const [isToggled, setIsToggled] = useState(false); // Initial state set to false

  const toggle = () => {
    setIsToggled((prev) => !prev); // Toggle the state
  };
  // State to keep track of current date and tasks
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Sets hours, minutes, seconds, and milliseconds to zero
    return now;
  });
  const [tasks, setTasks] = useState([]);
  // Function to fetch tasks from Firestore

  // Function to add a new task
  const handleAddTask = async (e) => {
    e.preventDefault(); // Prevent form submission default behavior
    if (!newTaskName.trim()) return; // Check if the input is not empty
    const taskDate = new Date(currentDate);
    taskDate.setHours(0, 0, 0, 0); // Set time to 00:00:00.000 UTC
    if (currentUser) {
      const newTask = {
        name: newTaskName,
        completed: false,
        date: taskDate.toISOString().split('T')[0],
      };
      //   console.log('adding: ', tas;k)
      try {
        const docRef = await addDoc(
          collection(db, 'users', currentUser.id, 'todo'),
          newTask,
        );
        // Optimistically update the state with the new task
        // Assume the task has an id property that matches the Firestore document id
        setTasks((prevTasks) => [...prevTasks, { ...newTask, id: docRef.id }]);
        setNewTaskName(''); // Clear input after successful addition
      } catch (error) {
        console.error('Error adding task to Firestore: ', error);
      }
    } else {
      console.log('No user signed in');
    }
  };
  // Function to toggle task completion
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

  // Function to format the date displayed
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  // Function to change the current date
  const changeDate = (direction) => {
    let newDate = new Date(currentDate); // Ensures the date is parsed as local time

    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    // console.log(currentDate);
    // console.log(newDate);
    // console.log(newDate.split('T')[0]);
    setCurrentDate(newDate);
  };
  useEffect(() => {
    const deleteOldTasks = async () => {
      if (!currentUser) return;

      const now = new Date();
      now.setHours(0, 0, 0, 0); // Normalize current date to start of the day for comparison
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7)); // Calculate date 7 days ago

      const tasksRef = collection(db, 'users', currentUser.id, 'todo');
      const q = query(tasksRef); // Fetch all tasks for simplicity in this example

      try {
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (document) => {
          const task = { id: document.id, ...document.data() };
          const taskDate = new Date(task.date);
          if (taskDate < sevenDaysAgo) {
            // If task date is more than 7 days in the past
            // Delete the task from Firestore
            await deleteDoc(
              doc(db, 'users', currentUser.id, 'todo', document.id),
            );
            console.log(`Deleted old task with id: ${document.id}`);
          }
        });
      } catch (error) {
        console.error('Error deleting old tasks: ', error);
      }
    };

    deleteOldTasks();
  }, [currentUser]); // This effect depends on currentUser

  useEffect(() => {
    console.log('calling tasks');
    const fetchTasks = async () => {
      if (!currentUser) return;

      const tasksRef = collection(db, 'users', currentUser.id, 'todo');
      const q = query(tasksRef);

      try {
        const querySnapshot = await getDocs(q);

        const fetchedTasks = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Error fetching tasks from Firestore: ', error);
      }
    };

    fetchTasks();
  }, [currentUser]);

  // Filter tasks based on the current date
  const filteredTasks = tasks.filter(
    (task) => task.date === currentDate.toISOString().split('T')[0],
  );
  const [selectedTask, setSelectedTask] = useState(null);
  const handleEditTask = async (taskId, newName, newDate) => {
    // Find the task in the local state
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) return; // Exit if task not found

    // Create a new updated task object
    const updatedTask = { ...tasks[taskIndex], name: newName, date: newDate };

    // Update the tasks array in the state
    setTasks((prevTasks) => [
      ...prevTasks.slice(0, taskIndex),
      updatedTask,
      ...prevTasks.slice(taskIndex + 1),
    ]);

    // Update the task in Firestore
    const taskRef = doc(db, 'users', currentUser.id, 'todo', taskId);
    try {
      await updateDoc(taskRef, {
        name: newName,
        date: newDate,
      });
      console.log(`Task ${taskId} updated successfully.`);
    } catch (error) {
      console.error('Error updating task: ', error);
      // Optionally, handle the error (e.g., show an error message or rollback the local update)
    }
  };

  const handleDeleteTask = async (taskId) => {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this task?',
    );
    if (!isConfirmed) {
      return; // Stop the deletion process if the user cancels
    }
    const taskRef = doc(db, 'users', currentUser.id, 'todo', taskId);
    try {
      await deleteDoc(taskRef);
      // Update the local state to remove the deleted task
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      setPopup(false);
    } catch (error) {
      console.error('Error deleting task: ', error);
    }
  };

  return (
    <div className="flex flex-col  gap-3 p-1.5">
      {/* <div className="text-2xl font-bold">To Do</div> */}
      <div className="flex w-3/5  text-xl ">
        <div
          onClick={() => setSection('Daily Tasks')}
          className={`flex w-1/2 cursor-pointer justify-center border-b-2 px-2 py-1   ${section == 'Daily Tasks' ? 'border-black font-semibold text-black dark:border-light-300 dark:text-light-300' : 'border-b-2 text-gray-300 dark:border-dark-900  dark:text-dark-900'}`}
        >
          Daily Tasks
        </div>
        <div
          onClick={() => setSection('All Tasks')}
          className={`flex grow cursor-pointer justify-center  px-2  py-1   ${section == 'All Tasks' ? 'border-b-2 border-black font-semibold text-black dark:border-light-300 dark:text-light-300' : 'border-b-1 text-gray-300 dark:border-dark-900 dark:text-dark-900'}`}
        >
          All Tasks
        </div>
      </div>
      {section == 'Daily Tasks' ? (
        <div className="h-100 w-full bg-light-gray p-2 dark:bg-dark-700">
          {' '}
          <div className="flex items-center gap-4 py-4">
            <div
              onClick={() => changeDate('prev')}
              className="flex h-8 w-8 transform cursor-pointer items-center justify-center rounded-full  transition duration-150 ease-in-out hover:scale-110 hover:bg-gray-300"
            >
              <MdKeyboardArrowLeft
                size={25}
                className="text-black group-hover:text-gray-300"
              />
            </div>
            <div
              onClick={() => changeDate('next')}
              className="flex h-8 w-8 transform cursor-pointer items-center justify-center rounded-full  transition duration-150 ease-in-out hover:scale-110 hover:bg-gray-300"
            >
              <MdKeyboardArrowRight
                size={25}
                className="text-black group-hover:text-gray-300"
              />
            </div>
            <div className="text-2xl font-semibold">
              {formatDate(currentDate)}
            </div>
          </div>
          <form
            onSubmit={handleAddTask}
            className="flex h-12  gap-4 rounded pl-2"
          >
            <input
              type="text"
              placeholder="New Task"
              className="w-3/4 border-b-2  bg-transparent text-lg  outline-none "
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
            />
            <button
              className="flex-1 rounded-md bg-apple-blue px-2 text-lg font-bold text-white dark:bg-apple-blue-dark dark:text-light-200"
              type="submit"
            >
              Add Task
            </button>
          </form>
          <div className="scrollbar scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-400 relative flex h-64 flex-col items-start overflow-y-scroll">
            {popup && (
              <ToDoPopup
                selectedTask={selectedTask}
                tasks={tasks}
                onClose={() => {
                  setPopup(false);
                }}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            )}
            {filteredTasks.length == 0 && (
              <>
                <div className="flex h-full w-full items-center justify-center p-2">
                  <div className="text-2xl font-semibold text-gray-300 ">
                    No Tasks
                  </div>
                </div>
              </>
            )}
            <div
              id="daily-tasks-list"
              className="mt-3 flex w-full flex-col  gap-2 p-1"
            >
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="duration:200 flex w-full cursor-pointer items-center gap-4 rounded-3xl bg-white px-4 py-4 transition  hover:bg-light-gray-500 dark:bg-dark-500"
                >
                  <div
                    onClick={() => toggleTaskCompletion(task.id)}
                    className={`m-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full ${task.completed ? 'bg-green-500' : 'bg-light-gray-600'} transition-colors duration-200`}
                  >
                    {task.completed && <FaCheck color="white" />}
                  </div>
                  <span
                    className={`text-lg ${task.completed ? 'line-through' : ''} flex h-full grow items-center `}
                    onClick={() => {
                      setSelectedTask(task);
                      //   console.log(task);
                      setPopup(true);
                    }}
                  >
                    {task.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-100 w-full bg-light-gray p-4 dark:bg-dark-700">
          <AllTasks tasks={tasks} />
        </div>
      )}
    </div>
  );
};

const ToDoPopup = ({ selectedTask, onClose, onEdit, onDelete }) => {
  const [editTaskName, setEditTaskName] = useState(
    selectedTask ? selectedTask.name : '',
  );
  const [editTaskDate, setEditTaskDate] = useState(
    selectedTask ? selectedTask.date : '',
  );

  const handleEdit = async (e) => {
    e.preventDefault();
    if (editTaskName.trim() && selectedTask) {
      await onEdit(selectedTask.id, editTaskName, editTaskDate);
      onClose(); // Close popup after editing
    }
    toggle();
  };

  return (
    <>
      <div className="absolute flex h-auto w-1/2 flex-col rounded border bg-white px-2 py-2 shadow-xl">
        <div className="flex justify-end">
          <button
            onClick={() => {
              onClose();
            }}
            className="duration:200 h-8 w-8 rounded-full px-2 pb-2 text-lg font-bold text-black transition hover:bg-gray-300 dark:bg-dark-700"
          >
            <IoClose size={25} />
          </button>
        </div>
        <form onSubmit={handleEdit} className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Edit Task Name"
            className="w-full border-b-2 bg-transparent text-lg outline-none"
            value={editTaskName}
            onChange={(e) => setEditTaskName(e.target.value)}
          />
          <input
            type="date"
            className="w-full border-b-2 bg-transparent text-lg outline-none"
            value={editTaskDate}
            onChange={(e) => setEditTaskDate(e.target.value)}
          />
          <button
            className="mt-2 rounded-md bg-primary-btn-color px-2 text-lg font-bold text-white"
            type="submit"
          >
            Save Changes
          </button>
        </form>
        <button
          onClick={() => onDelete(selectedTask.id)}
          className="ease duration:200 mt-4 rounded-3xl bg-red-btn py-2 font-semibold text-white transition hover:brightness-110"
        >
          Delete
        </button>
      </div>
    </>
  );
};

export default ToDo;
