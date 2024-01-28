import React, { useState, useEffect } from 'react';
import './DashboardCards.scss';

const DashboardPomodoro = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes for work session
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work'); // "work" or "break"
  const [showSettings, setShowSettings] = useState(false);
  const [timerSettings, setTimerSettings] = useState({
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  });

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60); // reset to 25 mins for work, 5 mins for break
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  const handleSettingChange = (event) => {
    const { name, value } = event.target;
    setTimerSettings({ ...timerSettings, [name]: value * 60 });
  };
  const changeMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(timerSettings[newMode]);
  };
  const SettingsPopup = () => (
    <div className="settings-popup">
      <div className="settings-content">
        <label>
          Work:{' '}
          <input
            type="number"
            name="work"
            defaultValue={timerSettings.work / 60}
            onChange={handleSettingChange}
          />
        </label>
        <label>
          Short Break:{' '}
          <input
            type="number"
            name="shortBreak"
            defaultValue={timerSettings.shortBreak / 60}
            onChange={handleSettingChange}
          />
        </label>
        <label>
          Long Break:{' '}
          <input
            type="number"
            name="longBreak"
            defaultValue={timerSettings.longBreak / 60}
            onChange={handleSettingChange}
          />
        </label>
        <button
          className="normal-btn btn"
          onClick={() => setShowSettings(false)}
        >
          Close
        </button>
      </div>
    </div>
  );
  return (
    <div className="dashboard-pomodoro-wrapper flexCol gapOne ">
      <div className="dashboard-pomodoro-container bg-light-300 dark:bg-dark-500 ">
        <div className="timer-display ">{formatTime(timeLeft)}</div>
        <div className="controls">
          <button onClick={toggleTimer}>{isRunning ? 'Pause' : 'Start'}</button>
          <button onClick={resetTimer}>Reset</button>
        </div>
      </div>
      <div className="pomodoro-change-timer flexCenter gapOne bg-light-300 dark:bg-dark-500">
        <button onClick={() => changeMode('work')}>Timer</button>
        <button onClick={() => changeMode('shortBreak')}>Short Break</button>
        <button onClick={() => changeMode('longBreak')}>Long Break</button>
      </div>
      <button className="normal-btn btn" onClick={() => setShowSettings(true)}>
        Settings
      </button>
      {showSettings && <SettingsPopup />}
    </div>
  );
};

export default DashboardPomodoro;
