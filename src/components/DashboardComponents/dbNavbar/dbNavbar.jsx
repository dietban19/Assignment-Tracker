import React, { useState, useEffect } from 'react';
import './dbNavbar.scss';
import { CiSearch } from 'react-icons/ci';
import { CiSun } from 'react-icons/ci';

import { FaMoon } from 'react-icons/fa';
const dbNavbar = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);
  return (
    <div className="dbNavbar-container dark:bg-dark-800 flex bg-white">
      <div className="dbNavbar-logo center">eduTrack</div>
      <div className="dbNavbar-search">
        <CiSearch />
        <input type="text" placeholder="Search" />
      </div>
      <div className="dbNavbar-btns gapOne flex">
        <button>1</button>
        <button>2</button>
        <button onClick={toggleDarkMode}>
          {darkMode ? <CiSun size={25} /> : <FaMoon size={25} />}
        </button>
      </div>
      <div className="dashboard-btn"></div>
    </div>
  );
};

export default dbNavbar;
