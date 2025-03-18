import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { changePassword, logout } from "../redux/authSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import CustomAlert from "./CustomAlert"; // Import CustomAlert
import "../css/ChangePassword.css";

export default function ChangePassword() {
    const dispatch = useDispatch();
    const username = useSelector(state => state.auth.username) || "User";

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [alert, setAlert] = useState({ message: "", type: "" });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setAlert({ message: "New password and confirm password do not match!", type: "error" });
            return;
        }

        setUpdating(true);

        dispatch(changePassword({ username, oldPassword, newPassword }))
            .then(() => {
                setAlert({ message: "Password updated successfully! Logging out...", type: "success" });

                setTimeout(() => {
                    setUpdating(false);
                    dispatch(logout());
                }, 1000);
            })
            .catch(() => {
                setAlert({ message: "Failed to update password!", type: "error" });
                setUpdating(false);
            });
    };

    return (
        <div className="change-password-container">
            <h2>🔐 Change Password</h2>

            {/* Custom Alert */}
            <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert({ message: "", type: "" })} />

            <form onSubmit={handleSubmit}>
                <input type="hidden" value={username} readOnly />

                <div className="input-group">
                    <label>Current Password</label>
                    <div className="password-wrapper">
                        <input
                            type={showOld ? "text" : "password"}
                            placeholder="Current Password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                        <span onClick={() => setShowOld(!showOld)}>
                            {showOld ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </div>

                <div className="input-group">
                    <label>New Password</label>
                    <div className="password-wrapper">
                        <input
                            type={showNew ? "text" : "password"}
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <span onClick={() => setShowNew(!showNew)}>
                            {showNew ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </div>

                <div className="input-group">
                    <label>Confirm Password</label>
                    <div className="password-wrapper">
                        <input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <span onClick={() => setShowConfirm(!showConfirm)}>
                            {showConfirm ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </div>

                <button type="submit" className="update-btn" disabled={updating}>
                    {updating ? "Updating..." : "Update Password"}
                </button>
            </form>
        </div>
    );
}
