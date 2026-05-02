/**
 * APIIntegrationDemo.jsx
 * 
 * Demo page showing:
 * 1. GET request example (fetching from /api/user)
 * 2. POST request example (registering a new user)
 * 3. Error handling
 * 4. Loading states
 * 
 * How to use this page:
 * - Add to your routes: <Route path="/demo" element={<APIIntegrationDemo />} />
 * - Navigate to http://localhost:5173/demo
 * - Test backend connection
 */

import { Heart, Zap, BookOpen } from "lucide-react";
import UserListExample from "../../components/examples/UserListExample";
import TestForm from "../../components/examples/TestForm";

export default function APIIntegrationDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 Backend Integration Demo
          </h1>
          <p className="text-gray-600">
            Testing your MERN Stack Connection
          </p>
        </div>

        {/* Status Bar */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-900">API Configuration</p>
              <p className="text-sm text-blue-700 font-mono">
                {import.meta.env.VITE_API_URL || "Not configured"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-600 mb-1">Backend Status:</p>
              <p className="text-sm font-semibold text-green-600">✓ Ready to test</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - GET Example */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Zap className="text-green-600" size={18} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">GET Request</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Fetching data from <code className="bg-gray-100 px-2 py-1 rounded text-xs">/api/user</code>
            </p>
            <UserListExample />
          </div>

          {/* Right Column - POST Example */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Heart className="text-purple-600" size={18} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">POST Request</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Sending data to <code className="bg-gray-100 px-2 py-1 rounded text-xs">/auth/register</code>
            </p>
            <TestForm />
          </div>
        </div>

        {/* Documentation */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="text-blue-600" size={24} />
            <h3 className="text-2xl font-semibold text-gray-900">How to Use</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* GET Request Guide */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">GET Request Pattern</h4>
              <div className="bg-gray-900 p-4 rounded-lg mb-4">
                <pre className="text-green-400 text-xs overflow-auto">
{`import api from "@/services/api";
import { useEffect, useState } from "react";

export default function Component() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/user");
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <div>{JSON.stringify(data)}</div>;
}`}
                </pre>
              </div>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>✓ Use <code className="bg-gray-100 px-1">useEffect</code> for data fetching</li>
                <li>✓ Handle loading state</li>
                <li>✓ Catch and display errors</li>
                <li>✓ Use axios/api instance (pre-configured)</li>
              </ul>
            </div>

            {/* POST Request Guide */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">POST Request Pattern</h4>
              <div className="bg-gray-900 p-4 rounded-lg mb-4">
                <pre className="text-green-400 text-xs overflow-auto">
{`import api from "@/services/api";
import { useState } from "react";

export default function Component() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      const response = await api.post(
        "/auth/register",
        formData
      );
      console.log("Success:", response.data);
    } catch (err) {
      setError(
        err.response?.data?.error 
        || "Request failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(newFormData);
    }}>
      {/* form fields */}
    </form>
  );
}`}
                </pre>
              </div>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>✓ Handle form submission</li>
                <li>✓ Send JSON data via POST</li>
                <li>✓ Handle response & errors</li>
                <li>✓ Show user feedback</li>
              </ul>
            </div>
          </div>

          {/* Important Notes */}
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-semibold text-amber-900 mb-2">📌 Important Notes</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>✓ API instance auto-adds auth token from localStorage</li>
              <li>✓ CORS is configured on backend (no extra config needed)</li>
              <li>✓ Environment variable: <code className="bg-white px-1">VITE_API_URL</code></li>
              <li>✓ Token stored in localStorage after login</li>
              <li>✓ 401 errors auto-redirect to /login</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Need help? Check the example components:</p>
          <p className="font-mono text-xs mt-2">
            src/components/examples/UserListExample.jsx<br />
            src/components/examples/TestForm.jsx
          </p>
        </div>
      </div>
    </div>
  );
}
