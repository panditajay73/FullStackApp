import React, { useEffect } from "react";
import "../css/CustomAlert.css";

export default function CustomAlert({ message, type, onClose }) {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose(); // Auto-hide alert after 3 seconds
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    if (!message) return null; // Hide if no message

    return (
        <div className={`custom-alert ${type}`}>
            {message}
            <span className="close-btn" onClick={onClose}>&times;</span>
        </div>
    );
}
