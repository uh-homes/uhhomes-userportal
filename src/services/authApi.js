// src/services/authApi.js
import { toast } from "react-toastify";
import api from "../Api/api"; // Make sure you have this api configured

export const loginUser = async (userData) => {
  try {
    const response = await api.post("/users/login", userData);
    return response.data.data.user;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post("/users/register", userData);
    return response.data;
  } catch (error) {
    console.error("Register failed:", error);
    throw error;
  }
};

export const fetchCurrentUser = async () => {
  try {
    const response = await api.get("/users/current-user");
    return response.data.data;
  } catch (error) {
    console.error("Fetch current user failed:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const res = await api.post("/users/logout");
    toast.success(res.data.message);
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};

export const updateUserProfile = async (data) => {
  try {
    const response = await api.put("/users/update", data);
    return response.data.data;
  } catch (error) {
    console.error("Update user profile failed:", error);
    throw error;
  }
};

export const sendSignUpOTP = async (email, phone) => {
  try {
    const response = await api.post("/users/signup-otp", { email, phone });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifySignUpOTP = async (email, otp) => {
  try {
    const response = await api.post("/users/verify-signup-otp", { email, otp });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendOTP = async (email) => {
  try {
    const response = await api.post("/users/send-otp", { email });
    return response.data.data;
  } catch (error) {
    console.error("Send OTP failed:", error);
    throw error;
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const response = await api.post("/users/verify-otp", { email, otp });
    return response.data.data;
  } catch (error) {
    console.error("Verify OTP failed:", error);
    throw error;
  }
};

export const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await api.post("/users/reset-password", {
      email,
      otp,
      newPassword,
    });
    return response.data.data;
  } catch (error) {
    console.error("Reset password failed:", error);
    throw error;
  }
};

export const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await api.patch("/users/update-password", {
      oldPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Change password failed:", error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/user/${userId}`);
    return response.data.data;
  } catch (error) {
    console.error("Fetch user by ID failed:", error);
    throw error;
  }
};
