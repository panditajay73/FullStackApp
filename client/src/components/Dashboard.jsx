import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import ChangePassword from './ChangePassword';
import ApprovePM from './ApprovePM';
import CreateTask from './CreateTask';
import ManageTask from './ManageTask';
import TaskStatus from './TaskStatus';
import UpdateTaskStatus from './UpdateTaskStatus';
import AssignTask from './AssignTask';
import '../css/Dashboard.css';
import Footer from "./Footer"; 

export default function Dashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeComponent, setActiveComponent] = useState(null);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [manageTaskMenuOpen, setManageTaskMenuOpen] = useState(false); // New state for Manage Task dropdown

    const username = useSelector(state => state.auth.username) || "User";
    const role = useSelector(state => state.auth.role) || "Guest";

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    return (
        <div className="dashboard-container">
            {/* Navbar */}
            <nav className="dashboard-nav">
                <div className="nav-logo" onClick={() => { 
                    setActiveComponent(null); 
                    setShowChangePassword(false);
                }} style={{ cursor: 'pointer' }}>
                    🚀 Project Dashboard
                </div>

                {/* Centered Task Links */}
                <div className="nav-links">
                    {role !== "User" && (
                        <button onClick={() => { setShowChangePassword(false); setActiveComponent('CreateTask'); }}>
                            Create Task
                        </button>
                    )}

                    {/* Manage Task - Conditional Rendering */}
                    <div className="dropdown-container">
                        <button onClick={() => {
                            setShowChangePassword(false);
                            if (role === "User") {
                                setActiveComponent('UpdateTaskStatus'); // Open directly for Users
                            } else {
                                setManageTaskMenuOpen(!manageTaskMenuOpen); // Open dropdown for Admins/PMs
                            }
                        }}>
                            Manage Task
                        </button>

                        {manageTaskMenuOpen && (role === "Admin" || role === "Project Manager") && (
                            <div className="dropdown-menu2">
                                <button onClick={() => { 
                                    setActiveComponent('UpdateTaskStatus'); 
                                    setManageTaskMenuOpen(false); 
                                }}>
                                    Update Status
                                </button>
                                <button onClick={() => { 
                                    setActiveComponent('AssignTask'); 
                                    setManageTaskMenuOpen(false); 
                                }}>
                                    Assign Task
                                </button>
                            </div>
                        )}
                    </div>

                    <button onClick={() => { setShowChangePassword(false); setActiveComponent('TaskStatus'); }}>
                        Task History
                    </button>
                </div>

                {/* User Info & Dropdown */}
                <div className="user-info">
                    <span className="username">Welcome, {username}.</span>
                    <span className={`role-badge ${role.toLowerCase()}`}>{role}</span>
                    <FaUserCircle className="user-icon" onClick={() => setMenuOpen(!menuOpen)} />
                </div>
            </nav>

            {/* Dropdown Menu */}
            {menuOpen && (
                <div className="dropdown-menu">
                    <button onClick={() => { setShowChangePassword(true); setMenuOpen(false); }}>
                        Change Password
                    </button>
                    {role === "Admin" && (
                        <button onClick={() => { setActiveComponent('ApprovePM'); setShowChangePassword(false); setMenuOpen(false); }}>
                            Approve PM's
                        </button>
                    )}
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            )}

            {/* Main Dashboard Content */}
            <div className="dashboard-content">
                {showChangePassword ? (
                    <ChangePassword />
                ) : activeComponent ? (
                    <>
                        {activeComponent === 'CreateTask' && <CreateTask />}
                        {activeComponent === 'ManageTask' && <ManageTask />}
                        {activeComponent === 'TaskStatus' && <TaskStatus />}
                        {activeComponent === 'UpdateTaskStatus' && <UpdateTaskStatus />}
                        {activeComponent === 'AssignTask' && <AssignTask />}
                        {activeComponent === 'ApprovePM' && <ApprovePM />}
                    </>
                ) : (
                    // Default welcome screen
                    <div className="welcome-screen">
                        <h1>Welcome, {username}!</h1>
                        <h3 className="user-role">Role: <span className={`role-badge ${role.toLowerCase()}`}>{role}</span></h3>
                        <p>Your tools and projects at a glance.</p>

                        <div className="dashboard-cards">
                            <div className="card">
                                <h3>📁 Project Management</h3>
                                <p>Track and manage your tasks.</p>
                            </div>
                            <div className="card">
                                <h3>📊 Reports & Analytics</h3>
                                <p>View detailed project insights.</p>
                            </div>
                            <div className="card">
                                <h3>⚙️ Settings</h3>
                                <p>Customize your preferences.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Component */}
            <Footer />
        </div>
    );
}
