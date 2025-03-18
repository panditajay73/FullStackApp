import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = "https://localhost:7152/api/auth";

// Signup Action
export const signupUser = createAsyncThunk("auth/signupUser", async (userData, { rejectWithValue }) => {
    try {
        const newUser = { 
            username: userData.username, 
            email: userData.email, 
            passwordHash: userData.passwordHash, 
            salt: userData.passwordHash, // Salt same as password
            role: userData.role 
        };
        console.log("Signup Request Payload:", newUser); // Debugging
        const response = await axios.post(`${API_URL}/signup`, newUser);
        
        return { username: newUser.username, role: newUser.role, message: response.data };
    } catch (error) {
        console.error("Signup Error:", error.response?.data);
        return rejectWithValue(error.response?.data || "Signup failed");
    }
});


// Login Action
export const loginUser = createAsyncThunk("auth/loginUser", async (credentials, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${API_URL}/login`, credentials);
        const { token, username, role } = response.data; // Assuming API returns role
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        localStorage.setItem("role", role);
        return { token, username, role };
    } catch (error) {
        return rejectWithValue(error.response?.data.message || "Login failed");
    }
});
// Async thunk for changing password
export const changePassword = createAsyncThunk("auth/changePassword", async ({ username, oldPassword, newPassword }, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${API_URL}/change-password`, {
            username,
            oldPassword,
            newPassword,
        });
        return response.data.message;
    } catch (error) {
        return rejectWithValue(error.response?.data.message || "Failed to update password");
    }
});
const authSlice = createSlice({
    name: "auth",
    initialState: { 
        token: localStorage.getItem("token") || null, 
        username: localStorage.getItem("username") || null,
        role: localStorage.getItem("role") || null,
        loading: false, 
        error: null 
    },
    reducers: {
        logout: (state) => {
            state.token = null;
            state.username = null;
            state.role = null;
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("role");
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.username = action.payload.username;
                state.role = action.payload.role;
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
            
    }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
