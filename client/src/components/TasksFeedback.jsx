import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

export default function TasksFeedback({ taskId }) {
    const token = useSelector(state => state.auth.token);
    const [taskDetails, setTaskDetails] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        const fetchTaskData = async () => {
            try {
                const response = await fetch(`https://localhost:7152/api/tasks/${taskId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) throw new Error("Failed to fetch task details");

                const data = await response.json();
                setTaskDetails(data);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchComments = async () => {
            try {
                const response = await fetch(`https://localhost:7152/api/tasks/comments/${taskId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) throw new Error("Failed to fetch comments");

                const data = await response.json();

                // Fetch usernames for each userId
                const updatedComments = await Promise.all(
                    data.map(async (comment) => {
                        try {
                            const userResponse = await fetch(
                                `https://localhost:7152/api/tasks/get-username/${comment.userId}`,
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                            const usernameData = await userResponse.json();
                            return { ...comment, username: usernameData.username || "Unknown User" };
                        } catch {
                            return { ...comment, username: "Unknown User" };
                        }
                    })
                );

                setComments(updatedComments);
            } catch (error) {
                console.error(error);
            }
        };

        fetchTaskData();
        fetchComments();
    }, [taskId, token]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            const response = await fetch("https://localhost:7152/api/tasks/addComment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ taskId: parseInt(taskId), comment: newComment }),
            });

            if (!response.ok) throw new Error("Failed to add comment");

            setComments([...comments, { comment: newComment, username: "You", createdAt: new Date() }]);
            setNewComment("");
        } catch (error) {
            console.error(error);
        }
    };

    if (!taskDetails) return <p>Loading task details...</p>;

    return (
        <div style={{
            width: "80%",
            maxWidth: "800px",
            margin: "20px auto",
            padding: "15px",
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 1)",
            background: "#2c5262",
            color: "#fff",
            fontFamily: "Arial, sans-serif",
            height: "400px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
        }}>
            <h2 style={{ textAlign: "center", color: "#fff", marginBottom: "10px" }}>Task Details</h2>

            <div style={{ textAlign: "left", fontSize: "12px", lineHeight: "1.4", color: "#ddd" }}>
                <p><strong>Title:</strong> {taskDetails.title}</p>
                <p><strong>Description:</strong> {taskDetails.description}</p>
                <p><strong>Status:</strong> {taskDetails.status}</p>
            </div>
            <div style={{height:"1px", width:"100%", background:"#fff", marginBottom:"7px"}}></div>
            <div
                style={{
                    flexGrow: 1,
                    overflowY: "scroll",
                    paddingRight: "10px",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    WebkitOverflowScrolling: "touch"
                }}
            >
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {comments.length > 0 ? (
                        comments.map((c, index) => (
                            <li
                                key={index}
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    marginBottom: "10px",
                                    padding: "10px",
                                    borderRadius: "6px",
                                    background: "transparent",
                                    border: "none"
                                }}
                            >
                                <FontAwesomeIcon icon={faUser} style={{ marginRight: "10px", color: "#fff" }} />
                                <div>
                                    <strong style={{ fontSize: "12px", color: "#fff" }}>{c.username} ( <small style={{ color: "#aaa", fontSize: "9px" }}>{new Date(c.createdAt).toLocaleString()}</small>)</strong>
                                    <p style={{ margin: "5px 0", fontSize: "10px", color: "#ddd" }}>{c.comment}</p>
                                   
                                </div>
                            </li>
                        ))
                    ) : (
                        <p style={{ color: "#bbb", fontStyle: "italic", fontSize: "10px" }}>No comments yet.</p>
                    )}
                </ul>
            </div>

            <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                style={{
                    width: "90%",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "none",
                    resize: "none",
                    height: "50px",
                    marginBottom: "5px",
                    background: "#1e3a47",
                    color: "#fff",
                    fontSize: "10px",
                    marginTop:"20px"
                }}
            />
            <button
                onClick={handleAddComment}
                style={{
                    width: "30%",
                    padding: "8px",
                    background: "#1e3a47",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "10px"
                }}>
                Add Comment
            </button>
        </div>
    );
}
