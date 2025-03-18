import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import TasksFeedback from './components/TasksFeedback';

function App() {
    const token = useSelector(state => state.auth.token);

    return (
        <Router>
            <Routes>
                <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
                <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <LoginForm />} />
                <Route path="/signup" element={token ? <Navigate to="/dashboard" /> : <SignupForm />} />
                <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/task-feedback/:taskId" element={<TasksFeedback />} />

            </Routes>
        </Router>
    );
}

export default App;
