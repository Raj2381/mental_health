/**
 * TestForm.jsx
 * 
 * Example component showing how to:
 * - Handle form input
 * - Send POST request to backend
 * - Handle success response
 * - Handle error responses
 * - Show user feedback
 * 
 * This demonstrates a basic POST request to /api/auth/register
 */

import { useState } from "react";
import api from "../../services/api.js";
import { Send, CheckCircle, AlertCircle } from "lucide-react";

export default function TestForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [message, setMessage] = useState("");
  const [responseData, setResponseData] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear status when user types
    setStatus(null);
    setMessage("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setMessage("");
    setResponseData(null);

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.password) {
        setStatus("error");
        setMessage("Please fill in all fields");
        setLoading(false);
        return;
      }

      // Send POST request to backend
      const response = await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      // Handle success
      setStatus("success");
      setMessage("Registration successful!");
      setResponseData({
        message: "User created successfully",
        token: response.data.token ? "✓ Token received" : "No token",
        user: response.data.user || {},
      });

      // Reset form after success
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "student",
      });
    } catch (error) {
      console.error("Error submitting form:", error);

      // Handle different types of errors
      if (error.response?.data?.error) {
        // Backend returned an error message
        setMessage(error.response.data.error);
      } else if (error.response?.data?.errors) {
        // Validation errors from backend
        const errorList = Object.values(error.response.data.errors)
          .flat()
          .join(", ");
        setMessage(errorList);
      } else if (error.request && !error.response) {
        // Network error
        setMessage("Network error: Cannot reach backend at http://localhost:3001");
      } else {
        // Unknown error
        setMessage("An error occurred. Please try again.");
      }

      setStatus("error");
      setResponseData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm max-w-md">
      <h2 className="text-lg font-semibold mb-4">Test Backend Connection (POST)</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            placeholder="John Doe"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            placeholder="user@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* Role Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="student">Student</option>
            <option value="counsellor">Counsellor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
        >
          <Send size={18} />
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      {/* Status Messages */}
      {status && (
        <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
          status === "success"
            ? "bg-green-50 border border-green-200"
            : "bg-red-50 border border-red-200"
        }`}>
          {status === "success" ? (
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
          ) : (
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          )}
          <div className="flex-1">
            <h4 className={`font-semibold mb-1 ${
              status === "success" ? "text-green-900" : "text-red-900"
            }`}>
              {status === "success" ? "Success!" : "Error"}
            </h4>
            <p className={`text-sm ${
              status === "success" ? "text-green-700" : "text-red-700"
            }`}>
              {message}
            </p>
          </div>
        </div>
      )}

      {/* Response Data */}
      {responseData && (
        <div className="mt-4 p-4 bg-gray-900 rounded-lg">
          <p className="text-xs text-gray-300 mb-2 font-semibold">RESPONSE DATA:</p>
          <pre className="text-green-400 text-xs overflow-auto max-h-32">
            {JSON.stringify(responseData, null, 2)}
          </pre>
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-gray-500 mt-4">
         Endpoint: POST {import.meta.env.VITE_API_URL}/auth/register
      </p>
    </div>
  );
}
