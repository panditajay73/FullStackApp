import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaTrash } from "react-icons/fa"; // Import delete icon
import CustomAlert from "./CustomAlert"; // Import CustomAlert
import "../css/AssignTask.css"; 
import TasksFeedback from "./TasksFeedback";

export default function AssignTask() {
    const token = useSelector(state => state.auth.token);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [usernames, setUsernames] = useState({});
    const [activeTab, setActiveTab] = useState("notAssigned");
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [alert, setAlert] = useState({ message: "", type: "" }); // Alert state
 const [modalOpen, setModalOpen] = useState(false);
 const [selectedTaskId, setSelectedTaskId] = useState(null);
    useEffect(() => {
        fetchTasks();
        fetchUsers();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await fetch("https://localhost:7152/api/tasks/all", {
                method: "GET",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to fetch tasks");
            const data = await response.json();
            setTasks(data);
            fetchUsernamesForAssignedTasks(data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch("https://localhost:7152/api/tasks/users", {
                method: "GET",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to fetch users");
            setUsers(await response.json());
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchUsernamesForAssignedTasks = async (tasks) => {
        const assignedTasks = tasks.filter(task => task.assignedTo);
        const newUsernames = { ...usernames };

        await Promise.all(assignedTasks.map(async (task) => {
            if (!newUsernames[task.assignedTo]) {
                try {
                    const response = await fetch(`https://localhost:7152/api/tasks/get-username/${task.assignedTo}`, {
                        method: "GET",
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (response.ok) {
                        const { username } = await response.json(); // Extract only the username
                        newUsernames[task.assignedTo] = username;
                    }
                } catch (error) {
                    console.error(`Error fetching username for user ${task.assignedTo}:`, error);
                }
            }
        }));

        setUsernames(newUsernames);
    };

    const handleAssignOrTransferTasks = async () => {
        if (!selectedUser) {
            setAlert({ message: "Please select a user!", type: "error" });
            return;
        }
        try {
            await Promise.all(selectedTasks.map(taskId =>
                fetch(`https://localhost:7152/api/tasks/assign?taskId=${taskId}&userId=${selectedUser}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                })
            ));
            setSelectedTasks([]);
            setAlert({ message: "Tasks assigned successfully!", type: "success" });
            fetchTasks();
        } catch (error) {
            console.error("Error assigning/transferring tasks:", error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            await fetch(`https://localhost:7152/api/tasks/delete/${taskId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            setAlert({ message: "Task deleted successfully!", type: "success" });
            fetchTasks();
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedTasks.length === 0) {
            setAlert({ message: "No tasks selected!", type: "error" });
            return;
        }
        if (!window.confirm("Are you sure you want to delete the selected tasks?")) return;
        try {
            await Promise.all(selectedTasks.map(taskId =>
                fetch(`https://localhost:7152/api/tasks/delete/${taskId}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                })
            ));
            setSelectedTasks([]);
            setAlert({ message: "Selected tasks deleted!", type: "success" });
            fetchTasks();
        } catch (error) {
            console.error("Error deleting tasks:", error);
        }
    };

    const handleTaskSelect = (taskId) => {
        setSelectedTasks(prev =>
            prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
        );
    };
    const handleTaskClick = (taskId) => {
        setSelectedTaskId(taskId);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedTaskId(null);
    };
    return (
        <div className="assign-task-container">
            <h2>Task Assignment</h2>

            {/* Custom Alert */}
            <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert({ message: "", type: "" })} />

            <div className="tabs">
                <button className={activeTab === "notAssigned" ? "active" : ""} onClick={() => setActiveTab("notAssigned")}>
                    Not Assigned Tasks
                </button>
                <button className={activeTab === "assigned" ? "active" : ""} onClick={() => setActiveTab("assigned")}>
                    Assigned Tasks
                </button>
            </div>
            
            
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
    {selectedTasks.length > 0 && (
        <button className="delete-button" onClick={handleBulkDelete}>
            Delete
        </button>
    )}
</div>

            <table className="task-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>{activeTab === "notAssigned" ? "Assign" : "Assigned To"}</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.filter(task => activeTab === "notAssigned" ? !task.assignedTo : task.assignedTo).map(task => (
                        <tr key={task.id}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedTasks.includes(task.id)}
                                    onChange={() => handleTaskSelect(task.id)}
                                />
                            </td>
                            <td><span className="task-title-link" onClick={() => handleTaskClick(task.id)}>
                                    {task.title}
                                </span></td>
                            <td>{task.description}</td>
                            <td>{activeTab === "assigned" ? (usernames[task.assignedTo] || "Fetching...") : "Unassigned"}</td>
                            <td>
                                <FaTrash className="delete-icon" onClick={() => handleDeleteTask(task.id)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
{modalOpen && (
    <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>✖</button>
            <TasksFeedback taskId={selectedTaskId} />
        </div>
    </div>
)}
            <div className="action-section">
                <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                    <option value="">Select User</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                </select>

                <button className="assign" onClick={handleAssignOrTransferTasks}>
                    {activeTab === "notAssigned" ? "Assign" : "Transfer"}
                </button>
            </div>
        </div>
        
    );
}
