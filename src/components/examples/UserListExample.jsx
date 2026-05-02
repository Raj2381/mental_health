/**
 * UserListExample.jsx
 * 
 * Example component showing how to:
 * - Fetch data from backend with useEffect
 * - Handle loading state
 * - Handle error state
 * - Display JSON response safely
 * 
 * This demonstrates a basic GET request to /api/user
 */

import { useEffect, useState } from "react";
import api from "../../services/api.js";
import { AlertCircle, Loader, CheckCircle } from "lucide-react";

export default function UserListExample() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Call the /api/user endpoint (no auth required for base endpoint)
        const response = await api.get("/user");

        // Store the response data
        setData(response.data);
      } catch (err) {
        console.error("Error fetching users:", err);
        
        // Set user-friendly error message
        if (err.response?.status === 404) {
          setError("Users endpoint not found");
        } else if (err.request && !err.response) {
          setError("Network error: Cannot reach backend at http://localhost:3001");
        } else {
          setError(err.response?.data?.error || "Failed to fetch users");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 bg-blue-50 rounded-lg">
        <Loader className="animate-spin mr-2" size={20} />
        <span className="text-blue-700">Fetching data from backend...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
        <div>
          <h3 className="font-semibold text-red-900">Error</h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Success state - display the data
  return (
    <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="text-green-600" size={20} />
        <h3 className="font-semibold text-green-900">API Response (GET /api/user)</h3>
      </div>

      {/* Display message */}
      {data?.message && (
        <div className="mb-4 p-3 bg-white rounded border border-green-200">
          <p className="text-sm font-medium text-gray-700">Message:</p>
          <p className="text-green-700 font-semibold">{data.message}</p>
        </div>
      )}

      {/* Display available endpoints */}
      {data?.availableEndpoints && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Available Endpoints:</p>
          <ul className="space-y-2">
            {data.availableEndpoints.map((endpoint, index) => (
              <li key={index} className="text-sm text-gray-600 p-2 bg-white rounded border border-green-100">
                • {endpoint}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Display raw JSON for debugging */}
      <div className="mt-4 p-3 bg-gray-900 rounded text-xs overflow-auto max-h-48">
        <pre className="text-green-400">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        ✓ Successfully connected to backend at {import.meta.env.VITE_API_URL}
      </p>
    </div>
  );
}
