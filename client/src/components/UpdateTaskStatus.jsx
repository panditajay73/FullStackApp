import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "../css/UpdateTaskStatus.css";
import CustomAlert from "./CustomAlert"; 
import TasksFeedback from "./TasksFeedback";

export default function UpdateTaskStatus() {
    const role = useSelector(state => state.auth.role);
    const token = useSelector(state => state.auth.token);
    const isUser = role === "User";
    const navigate = useNavigate();
    const apiUrl = isUser 
        ? "https://localhost:7152/api/tasks/my-tasks" 
        : "https://localhost:7152/api/tasks/all";

    const [tasks, setTasks] = useState([]);
    const [usernames, setUsernames] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [newStatus, setNewStatus] = useState("");
    const [alert, setAlert] = useState({ message: "", type: "" });
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(apiUrl, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error("Unauthorized or Failed to fetch tasks");

                const data = await response.json();
                setTasks(data);

                const userIds = [...new Set(
                    data.flatMap(task => [
                        parseInt(task.createdBy),
                        parseInt(task.assignedBy),
                        parseInt(task.assignedTo)
                    ])
                )];

                const userPromises = userIds.map(async (id) => {
                    const res = await fetch(`https://localhost:7152/api/tasks/get-username/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const userData = await res.json();
                    return { id, username: userData.username };
                });

                const users = await Promise.all(userPromises);
                const userMap = Object.fromEntries(users.map(user => [user.id, user.username]));

                setUsernames(userMap);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [apiUrl, token]);

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedTasks([]);
        } else {
            setSelectedTasks(tasks.map(task => task.id));
        }
        setSelectAll(!selectAll);
    };

    const handleSelectTask = (taskId) => {
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

    const handleUpdateStatus = async () => {
        if (!newStatus) {
            setAlert({ message: "Please select a status!", type: "error" });
            return;
        }
        if (selectedTasks.length === 0) {
            setAlert({ message: "No tasks selected!", type: "error" });
            return;
        }

        try {
            await Promise.all(selectedTasks.map(async (taskId) => {
                await fetch(`https://localhost:7152/api/tasks/update-status?taskId=${taskId}&status=${newStatus}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
            }));

            setAlert({ message: "Statuses updated successfully!", type: "success" });

            // Reload task data instead of full page reload
            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const updatedData = await response.json();
            setTasks(updatedData);
            setSelectedTasks([]);
            setSelectAll(false);
        } catch (error) {
            setAlert({ message: "Error updating statuses!", type: "error" });
        }
    };

    if (loading) return <p>Loading tasks...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="task-container">
            <h2>Update Task Status</h2>

            {/* Custom Alert */}
            {alert.message && <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert({ message: "", type: "" })} />}

            <table className="task-table">
                <thead>
                    <tr>
                        <th>
                            <input type="checkbox" onChange={handleSelectAll} checked={selectAll} />
                        </th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Created At</th>
                        <th>Created By</th>
                        <th>Assigned By</th>
                        {!isUser && <th>Assigned To</th>}
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map(task => (
                        <tr key={task.id}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedTasks.includes(task.id)}
                                    onChange={() => handleSelectTask(task.id)}
                                />
                            </td>
                            <td><span className="task-title-link" onClick={() => handleTaskClick(task.id)}>
                                    {task.title}
                                </span></td>
                            <td>{task.description}</td>
                            <td>{new Date(task.createdAt).toLocaleString()}</td>
                            <td>{usernames[parseInt(task.createdBy)] || "N/A"}</td>
                            <td>{usernames[parseInt(task.assignedBy)] || "N/A"}</td>
                            {!isUser && <td>{usernames[parseInt(task.assignedTo)] || "N/A"}</td>}
                            <td>
                                <span className={`status-${task.status.toLowerCase()}`}>
                                    {task.status}
                                </span>
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

            <div className="status-update-section">
                <select onChange={(e) => setNewStatus(e.target.value)} value={newStatus}>
                    <option value="">Select Status</option>
                    <option value="To-Do">To-Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                </select>
                <button onClick={handleUpdateStatus}>Update</button>
            </div>
        </div>
    );
}
