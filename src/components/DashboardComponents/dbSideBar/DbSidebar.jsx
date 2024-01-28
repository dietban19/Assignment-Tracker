import React from "react";
import { FaSquare } from "react-icons/fa6";
import { Link } from "react-router-dom";
import "./dbSidebar.scss";
import { CiCalendar } from "react-icons/ci";
import { PiNotepad } from "react-icons/pi";
import { FaRegMessage } from "react-icons/fa6";
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";
const DbSideBar = () => {
  return (
    <div className="sidebar-container">
      <div className="dashboard-one">
        <ul className="sidebar-ul">
          <li className="dashboard-btn primaryTextButton btn flexCenter">
            <div className="square-container">
              <FaSquare />
              <FaSquare />
              <FaSquare />
              <FaSquare />
            </div>
            <span>Dashboard</span>
          </li>
          <li>
            <Link to="/assignments">
              <MdOutlineAssignmentTurnedIn size={25} />
              <span>Assignments</span>
            </Link>
          </li>

          <li>
            <CiCalendar size={25} />
            <span> Calendar</span>
          </li>
          <li>
            <PiNotepad size={25} />
            <span> Tasks</span>
          </li>
          <li>
            <FaRegMessage size={20} />
            <span>Messages</span>
          </li>
        </ul>
      </div>
      <div className="dashboard-two">
        <h3>Categories</h3>
        <ul>
          <li>
            <div className="category-color"></div>
            <div className="category-name">Math</div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DbSideBar;
