import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import CustomAlert from "./CustomAlert";
import "../css/CreateTask.css";

export default function CreateTask() {
    const [task, setTask] = useState({
        title: "",
        description: "",
        status: "To-Do",
    });
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ message: "", type: "" });

    const token = useSelector((state) => state.auth.token);

    const handleChange = (e) => {
        setTask({ ...task, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!task.title || !task.description) {
            setAlert({ message: "Title and Description are required!", type: "error" });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                "https://localhost:7152/api/tasks/create",
                {
                    title: task.title,
                    description: task.description,
                    status: task.status,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                setAlert({ message: "Task created successfully!", type: "success" });

                // Clear the form
                setTask({ title: "", description: "", status: "To-Do" });
            }
        } catch (error) {
            setAlert({ message: "Task creation failed!", type: "error" });
        }

        setLoading(false);
    };

    return (
        <div className="task-container" style={{ width: "600px" }}>
            <h2>📝 Create Task</h2>
            <p>Create new tasks quickly.</p>

            {/* Custom Alert Component */}
            <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert({ message: "", type: "" })} />

            <form onSubmit={handleSubmit} className="task-form">
                <label>Title:</label>
                <input type="text" name="title" value={task.title} onChange={handleChange} required placeholder="Enter title"/>

                <label>Description:</label>
                <textarea name="description" value={task.description} onChange={handleChange} required placeholder="Enter description"/>

                <input type="hidden" name="status" value={task.status} />

                <button type="submit" disabled={loading}>
                    {loading ? "Creating Task..." : "Create Task"}
                </button>
            </form>
        </div>
    );
}
