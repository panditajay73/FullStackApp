import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CustomAlert from "./CustomAlert"; // Import CustomAlert

const API_URL = "https://localhost:7152/api/auth";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ message: "", type: "" });

    const navigate = useNavigate();

    const handleSendOTP = async () => {
        if (!email) {
            setAlert({ message: "Please enter a valid email.", type: "error" });
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_URL}/forgot-password`, { email });
            setAlert({ message: "OTP sent successfully! Check your email.", type: "success" });
            setStep(2);
        } catch (err) {
            setAlert({ message: err.response?.data?.message || "Failed to send OTP.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (otp.length !== 6) {
            setAlert({ message: "Invalid OTP. Please enter a 6-digit OTP.", type: "error" });
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_URL}/verify-otp`, { email, otp });
            setAlert({ message: "OTP verified successfully!", type: "success" });
            setStep(3);
        } catch (err) {
            setAlert({ message: err.response?.data?.message || "OTP verification failed.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword !== confirmPassword) {
            setAlert({ message: "Passwords do not match.", type: "error" });
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_URL}/reset-password`, { email, otp, newPassword });
            setAlert({ message: "Password reset successful! Redirecting...", type: "success" });
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            setAlert({ message: err.response?.data?.message || "Password reset failed.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <div style={{
                width: "350px", padding: "20px", borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)", backgroundColor: "white", textAlign: "center"
            }}>
                <h2 style={{ marginBottom: "15px", color: "#333" }}>Forgot Password</h2>

                {/* Custom Alert */}
                <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert({ message: "", type: "" })} />

                {step === 1 && (
                    <>
                        <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)}
                            style={{ width: "80%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                            required />
                        <button onClick={handleSendOTP} disabled={loading}
                            style={{ width: "50%", padding: "10px", fontWeight: "bold", backgroundColor: "#764ba2", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                            {loading ? "Sending OTP..." : "Send OTP"}
                        </button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)}
                            style={{ width: "80%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                            required />
                        <button onClick={handleVerifyOTP} disabled={loading}
                            style={{ width: "50%", padding: "10px", fontWeight: "bold", backgroundColor: "#764ba2", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </>
                )}

                {step === 3 && (
                    <>
                        <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                            style={{ width: "80%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                            required />
                        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{ width: "80%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                            required />
                        <button onClick={handleResetPassword} disabled={loading}
                            style={{ width: "50%", padding: "10px", fontWeight: "bold", backgroundColor: "#764ba2", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
