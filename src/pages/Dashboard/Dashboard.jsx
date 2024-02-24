import React, { useState, useEffect } from 'react';
import './Dashboard.scss';
import { useUserContext } from '../../context/userContext';
import AssignmentPopup from '../../components/DashboardComponents/AssignmentPopup';
import DbNavbar from '../../components/DashboardComponents/dbNavbar/dbNavbar';
import DbSideBar from '../../components/DashboardComponents/dbSideBar/dbSidebar';
import UserCard from '../../components/DashboardComponents/DashboardCards/UserCard';
import TodaysTasks from '../../components/DashboardComponents/DashboardCards/TodaysTasks';
import DashboardCalendar from '../../components/DashboardComponents/DashboardCards/Calendar/DashboardCalendar';
import DashboardPomodoro from '../../components/DashboardComponents/DashboardCards/DashboardPomodoro';
import CalendarComponent from '../../components/Calendar/CalendarComponent';
import ToDo from '../../components/DashboardComponents/ToDo/ToDo';
const Dashboard = () => {
  return (
    <div className="dashboard-wrapper bg-white-100 dark:bg-dark-900">
      <div className="dashboard-container">
        <div className="dashboard-header ">
          <DbNavbar />
        </div>
        <div className="dashboard-middle">
          <div className="dashboard-sidebar db-todo-container min-h-16 w-1/2 rounded-lg  bg-white p-4 transition duration-200 dark:bg-dark-800">
            <DbSideBar />
          </div>
          <div className="dashboard-main-container">
            <div className="db-main-top flexCol gapOne">
              <div className="dashboard-user db-todo-container min-h-16 w-1/2 rounded-lg  bg-white p-4 transition duration-200 dark:bg-dark-800">
                <UserCard />
              </div>
              <div className="db-todo-container min-h-16 w-1/2 rounded-lg  bg-white p-4 transition duration-200 dark:bg-dark-800">
                <TodaysTasks />
              </div>
            </div>
            <div className="mb-4 flex gap-4 ">
              <div className="db-todo-container min-h-16 w-1/2 rounded-lg  bg-white p-4 transition duration-200 dark:bg-dark-800">
                <ToDo />
              </div>{' '}
              <div className="dashboard-pomodoro db-todo-container min-h-16 w-1/2 w-1/2  rounded-lg bg-white p-4 transition duration-200 dark:bg-dark-800">
                <DashboardPomodoro />
              </div>
            </div>

            <div className="dashboard-calendar db-todo-container min-h-16 w-1/2 rounded-lg  bg-white p-4 transition duration-200 dark:bg-dark-800">
              <CalendarComponent />
            </div>

            <div className="db-main-right flexCol gapOne">
              {/* <div className="dashboard-add-task db-todo-container dark:bg-dark-800 min-h-16 w-1/2  rounded-lg bg-white p-4 transition duration-200">Add Task</div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
