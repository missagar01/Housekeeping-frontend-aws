"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authAPI } from "../Api/loginApi";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuth()

  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [toast, setToast] = useState({ show: false, message: "", type: "" })

  // Don't auto-redirect on mount, let ProtectedRoute handle ita
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
      showToast("Please enter both username and password", "error");
      return;
    }

    setIsLoginLoading(true);

    try {
      const response = await authAPI.login({
        username: formData.username.trim(),
        password: formData.password.trim()
      });

      if (response.message === 'Login successful' && response.user) {
        const user = response.user;
        const token = response.token || response.access_token || "";

        // GET USER DEPARTMENT FROM PROFILE API
        let userDepartment = "";
        try {
          const userProfile = await authAPI.getUserProfile(user.id, token);
          if (userProfile) {
            userDepartment = userProfile.department || userProfile.user_department || "";
            // console.log("User Profile:", userProfile);
          }
        } catch (profileError) {
          console.warn("Could not fetch user profile:", profileError);
        }

        // Store user data centrally
        setAuth({
          name: user.user_name || "",
          role: user.role || "",
          email: user.email_id || "",
          userId: user.id || "",
          department: userDepartment,
          token: token || "",
        });

        showToast(`Welcome back, ${user.user_name}!`, "success");

        // Navigate immediately
        if (user.role === 'user') {
          navigate("/dashboard/delegation");
        } else {
          navigate("/dashboard/admin");
        }
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const showToast = (message, type) => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" })
    }, 5000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 p-4">
      <div className="w-full max-w-md shadow-lg border border-blue-200 rounded-lg bg-white">
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-100 to-gray-100 rounded-t-lg">
          <img
            src="/logo.png"
            alt="Company Logo"
            className="w-20 h-20 object-contain"
          />

          <h2 className="text-2xl font-bold text-blue-700">
            HouseKeeping Module
          </h2>
        </div>
        <div className="h-1 bg-red-500 w-full"></div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="flex items-center text-blue-700 font-medium">
              <i className="fas fa-user h-4 w-4 mr-2"></i>
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="flex items-center text-blue-700 font-medium">
              <i className="fas fa-key h-4 w-4 mr-2"></i>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoComplete="current-password"
            />
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-gray-50 p-4 -mx-4 -mb-4 mt-4 rounded-b-lg">
            <button
              type="submit"
              className="w-full py-3 px-4 gradient-bg from-blue-600 to-blue-800 text-white rounded-md font-medium hover:from-blue-700 hover:to-blue-900 disabled:opacity-50 transition duration-200 shadow-md"
              disabled={isLoginLoading}
            >
              {isLoginLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Login
                </span>
              )}
            </button>
          </div>
        </form>

        {/* <div className="border-t border-gray-200 py-3 px-4 bg-gray-50 rounded-b-lg">
          <div className="text-center text-sm text-gray-600">
            <p>Demo Credentials:</p>
            <p className="font-mono">Username: tulesh | Password: tulesh123</p>
          </div>
        </div> */}

        <div className="fixed left-0 right-0 bottom-0 py-1 px-4 bg-gradient-to-r from-blue-600 to-gray-600 text-white text-center text-sm shadow-md z-10">
          <a
            href="https://www.botivate.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Powered by-<span className="font-semibold">Botivate</span>
          </a>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 z-50 ${toast.type === "success"
          ? "bg-green-100 text-green-800 border-l-4 border-green-500"
          : "bg-red-100 text-red-800 border-l-4 border-red-500"
          }`}>
          <div className="flex items-center">
            {toast.type === "success" ? "" : ""}
            <span className="ml-2 font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginPage
