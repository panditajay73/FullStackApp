import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

export default function TaskHistory() {
    const [tasks, setTasks] = useState([]);
    const [history, setHistory] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    const role = useSelector(state => state.auth.role); // Get role from Redux
    const token = useSelector(state => state.auth.token); // Get token from Redux

    const apiUrl = role === "User"
        ? "https://localhost:7152/api/tasks/my-tasks"
        : "https://localhost:7152/api/tasks/all";

    useEffect(() => {
        if (!token) return;

        axios
            .get(apiUrl, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => setTasks(res.data))
            .catch((err) => console.error("Error fetching tasks:", err));
    }, [token, apiUrl]);

    const fetchHistory = async (taskId) => {
        try {
            const res = await axios.get(`https://localhost:7152/api/tasks/history/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const updatedHistory = await Promise.all(
                res.data.map(async (entry) => {
                    const userId = parseInt(entry.updatedBy); // Convert to integer
                    const userRes = await axios.get(`https://localhost:7152/api/tasks/get-username/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const username = userRes.data.username; // Extract username
                    return { ...entry, updatedBy: username }; // Replace ID with username
                })
            );

            setHistory(updatedHistory);
            setSelectedTaskId(taskId);
            setShowModal(true);
        } catch (error) {
            console.error("Error fetching task history:", error);
        }
    };
    return (
        <div style={styles.taskContainer}>
            <h2>Task History</h2>
            <p>Check the status of your tasks here.</p>

            <div style={styles.taskList}>
                {tasks.map((task) => (
                    <div key={task.id} style={styles.taskCard}>
                        <h3><strong>Title:</strong> {task.title}</h3>
                        <p><strong>Description:</strong> {task.description}</p>
                        <p><strong>Status:</strong> {task.status}</p>
                        <p><strong>Created At:</strong> {new Date(task.createdAt).toLocaleString()}</p>
                        <button style={styles.historyButton} onClick={() => fetchHistory(task.id)}>Show History</button>
                    </div>
                ))}
            </div>

            {/* Modal for Task History */}
            {showModal && (
                <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div style={{ ...styles.modalContent, ...styles.modalContentHiddenScroll }} onClick={(e) => e.stopPropagation()}>
                        <button style={styles.closeModal} onClick={() => setShowModal(false)}>×</button>
                        <h3>Task History (ID: {selectedTaskId})</h3>
                        {history.length > 0 ? (
                            <ul style={styles.historyList}>
                                {history.map((entry) => (
                                    <li key={entry.id} style={styles.historyItem}>
                                        <p style={styles.historyText}><strong>Updated By:</strong> {entry.updatedBy}</p>
                                        <p style={styles.historyText}><strong>Old Status:</strong> {entry.oldStatus}</p>
                                        <p style={styles.historyText}><strong>New Status:</strong> {entry.newStatus}</p>
                                        <p style={styles.historyText}><strong>Updated At:</strong> {new Date(entry.updatedAt).toLocaleString()}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No history found.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Internal CSS using JavaScript object styles
const styles = {
    taskContainer: {
        padding: "20px",
        textAlign: "center",
    },
    taskList: {
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        justifyContent: "center",
    },
    taskCard: {
        background: "#31464d",
        padding: "15px",
        width: "300px",
        borderRadius: "8px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        textAlign: "left",
        color: "white",
    },
    historyButton: {
        background: "#007bff",
        color: "white",
        border: "none",
        padding: "8px 12px",
        cursor: "pointer",
        borderRadius: "5px",
        marginTop: "10px",
    },
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContentHiddenScroll: {
        "::-webkit-scrollbar": {
            display: "none",  // Chrome, Safari
        },
    },
    modalContent: {
        background: "rgba(49, 70, 77, 0.9)",
        backdropFilter: "blur(10px)",
        padding: "20px",
        width: "50%",
        maxWidth: "500px",
        maxHeight: "500px",  // Fixed height
        overflowY: "auto",   // Enable scroll if needed
        borderRadius: "8px",
        position: "relative",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        color: "white",
        scrollbarWidth: "none",  // Firefox
        msOverflowStyle: "none",
    },
    closeModal: {
        position: "absolute",
        top: "10px",
        right: "15px",
        background: "none",
        border: "none",
        fontSize: "20px",
        cursor: "pointer",
        color: "white",
    },
    historyList: {
        listStyleType: "none",
        padding: 0,
        marginTop: "10px",
    },
    historyItem: {
        background: "#3c5b63",
        padding: "10px",
        borderRadius: "5px",
        marginBottom: "10px",
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
    },
    historyText: {
        margin: "5px 0",
    }
};


