import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import AdminData from '../data/AdminData.json';
import { useNavigate } from 'react-router-dom'; // For redirecting after login

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loggedIn, setLoggedIn] = useState(false); // LoggedIn state to track login status
  const navigate = useNavigate(); // Hook to redirect after login

  // Check if the user is already logged in
  useEffect(() => {
    if (localStorage.getItem('loggedIn') === 'true') {
      setLoggedIn(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if the inputted username and password match the admin credentials
    if (username === AdminData.username && password === AdminData.password) {
      console.log('Login successful');
      setErrorMessage('');
      setLoggedIn(true);
      localStorage.setItem('loggedIn', 'true');

      // Store login status in localStorage
      localStorage.setItem('loggedIn', 'true');

      // Redirect to the admin dashboard or another page
      navigate('/dashboard'); // Example of a redirect after successful login
    } else {
      console.log('Login failed');
      setErrorMessage('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-96">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Admin Login</h2>
        {errorMessage && (
          <p className="text-red-500 text-center mb-4">{errorMessage}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaUser className="text-gray-500" />
              </span>
              <input
                type="text"
                id="username"
                className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-gray-200 outline-none focus:border-blue-500"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaLock className="text-gray-500" />
              </span>
              <input
                type="password"
                id="password"
                className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-gray-200 outline-none focus:border-blue-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
          >
            <FaSignInAlt className="mr-2" />
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
