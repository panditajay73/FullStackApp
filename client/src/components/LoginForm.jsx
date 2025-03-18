import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import Eye Icons
import CustomAlert from "./CustomAlert"; // Import CustomAlert
import "../css/LoginForm.css";

export default function LoginForm() {
    const [credentials, setCredentials] = useState({ usernameOrEmail: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [alert, setAlert] = useState({ message: "", type: "" }); // State for alerts

    const { loading, error } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

   const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.usernameOrEmail || !credentials.password) {
        setAlert({ message: "Please enter both username/email and password.", type: "error" });
        return;
    }

    const res = await dispatch(loginUser(credentials));
    
    if (res.meta.requestStatus === "fulfilled") {
        setAlert({ message: "Login successful! Redirecting...", type: "success" });
        setTimeout(() => navigate("/dashboard"), 1500);
    } else {
        setAlert({ message: res.payload || "Invalid credentials. Please try again.", type: "error" });
    }
};


    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Login</h2>

                {/* Custom Alert */}
                <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert({ message: "", type: "" })} />

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username or Email"
                        value={credentials.usernameOrEmail}
                        onChange={(e) => setCredentials({ ...credentials, usernameOrEmail: e.target.value })}
                        required
                    />
                    <div className="password-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            required
                        />
                        <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <div className="forgot-password-container">
                        <Link to="/forgot-password" className="forgot-password-link">
                            Forgot Password?
                        </Link>
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
                <p className="signup-link" style={{color:'black'}}>
                    Not registered? <Link to="/signup">Create an account</Link>
                </p>
            </div>
        </div>
    );
}
