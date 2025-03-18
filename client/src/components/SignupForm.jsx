import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser } from '../redux/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import '../css/SignupForm.css'; // Import external CSS

export default function SignupForm() {
    const [userData, setUserData] = useState({ 
        username: '', 
        email: '', 
        passwordHash: '', 
        role: 'User' // Default role
    });
    
    const { loading, error } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const newUser = { 
            ...userData, 
            salt: userData.passwordHash // Set salt as password
        };
    
        dispatch(signupUser(newUser)).then((res) => {
            if (res.meta.requestStatus === 'fulfilled') {
                if (newUser.role === "User") {
                    navigate('/login'); // Direct login if role is User
                } else {
                    alert("Registration sent for approval."); // Alert for other roles
                }
            }
        });
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <h2>Sign Up</h2>
                {error && <p className="error-text">{error}</p>}
                <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="form-group">
                        <label htmlFor="username" style={{color:'black'}}>Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Enter your username"
                            value={userData.username}
                            onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email" style={{color:'black'}}>Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            value={userData.email}
                            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" style={{color:'black'}}>Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            value={userData.passwordHash}
                            onChange={(e) => setUserData({ ...userData, passwordHash: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role" style={{color:'black'}}>Role</label>
                        <select 
                            id="role" 
                            name="role" 
                            value={userData.role} 
                            onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                            required
                        >
                            {/* <option value="Admin">Admin</option> */}
                            <option value="Project Manager">Project Manager</option>
                            <option value="User">User</option>
                        </select>
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Signing up...' : 'Sign Up'}
                    </button>
                </form>
                <p className="login-link" style={{color:'black'}}>
                    Already registered? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
}
