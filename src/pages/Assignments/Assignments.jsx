import React, { useState, useEffect } from 'react';
import './Assignments.scss';
import { useUserContext } from '../../context/userContext';
import AssignmentPopup from '../../components/DashboardComponents/AssignmentPopup';
import { GoPlus } from 'react-icons/go';
const Assignments = () => {
  const {
    currentUser,
    user,
    fetchUserAssignments,
    logout,
    setLoadingAuthState,
  } = useUserContext();
  const [shouldFetch, setShouldFetch] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [assignments, setAssignments] = useState([]); // State to store assignments
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedAssignments, setSelectedAssignments] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const openModalWithAssignment = (assignment) => {
    setShowModal(true);
    setSelectedAssignment(assignment);
  };
  // Update state to store multiple sort criteria
  const [sortCriteria, setSortCriteria] = useState([]);

  // ... existing functions ...

  const handleSort = (field) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
    sortAssignments(field, isAsc ? 'desc' : 'asc');
  };
  const sortAssignments = (field, direction) => {
    const sortedAssignments = [...assignments].sort((a, b) => {
      if (a[field] < b[field]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[field] > b[field]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    setAssignments(sortedAssignments);
  };

  // Call sortAssignments when sortCriteria changes
  useEffect(() => {
    sortAssignments();
  }, [sortCriteria]);
  useEffect(() => {
    if (currentUser?.id) {
      // Fetch assignments when currentUser is available
      fetchUserAssignments(currentUser.id)
        .then((fetchedAssignments) => {
          setAssignments(fetchedAssignments);
        })
        .catch((error) => {
          console.error('Error fetching assignments: ', error);
          // Handle the error appropriately
        });
    }
  }, [currentUser]); // Rerun when currentUser changes

  const refetchAssignments = () => {
    currentUser?.id &&
      fetchUserAssignments(currentUser.id)
        .then(setAssignments)
        .catch(console.error);
  };
  const formatHeader = (camelCase) => {
    const spaced = camelCase.replace(/([A-Z])/g, ' $1'); // Inserts a space before each uppercase letter
    return spaced.charAt(0).toUpperCase() + spaced.slice(1); // Capitalizes the first letter
  };
  const renderSortArrow = (field) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  return (
    <>
      <div className="assignment-table-header">
        <span>Assignment Tracker</span>
      </div>
      {showModal && (
        <AssignmentPopup
          selectedAssignment={selectedAssignment}
          onClose={() => {
            setShowModal(false);
            setSelectedAssignment(null);
            refetchAssignments();
          }}
        />
      )}

      {/* <button onClick={logout} className="logout">
        Logout
      </button> */}
      <div className="welcome">Welcome {currentUser.firstName}</div>
      <div className="assignments">
        <table className="assignments-table">
          <thead>
            <tr>
              {[
                'name',
                'category',
                'subject',

                'startDate',
                'dueDate',
                'status',
              ].map((field) => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  className={sortField === field ? 'sorted-header' : ''}
                >
                  {formatHeader(field)}
                  {renderSortArrow(field)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr
                key={assignment.id}
                onClick={() => openModalWithAssignment(assignment)}
              >
                <td className="assignment-title">
                  <span style={{ backgroundColor: assignment.color }}></span>
                  <span>{assignment.name}</span>{' '}
                </td>
                <td>{assignment.category}</td>
                <td>{assignment.subject}</td>

                <td>{assignment.startDate}</td>
                <td>{assignment.dueDate}</td>
                <td
                  style={{
                    backgroundColor:
                      assignment.status == 'Not Started'
                        ? '#db5844'
                        : assignment.status == 'Done'
                          ? '#08a80e'
                          : '#f5f298',
                    color:
                      assignment.status == 'In Progress' ? 'black' : 'white',
                  }}
                >
                  {assignment.status}
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={6}>
                {' '}
                <div className="add-assignment-container">
                  {' '}
                  <button
                    className="add-btn btn center"
                    onClick={() => setShowModal(true)}
                  >
                    <GoPlus size={25} />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Assignments;
