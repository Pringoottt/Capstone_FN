import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserCog, FaUserPlus } from 'react-icons/fa';

function Hero() {
  return (
    <div className="hero bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6">Enrollment System</h1>
        <p className="text-xl mb-8">Manage your educational journey with ease</p>
        <div className="flex justify-center space-x-4">
          <Link to="/admin" className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold flex items-center hover:bg-blue-100 transition duration-300">
            <FaUserCog className="mr-2" />
            Admin
          </Link>
          <Link to="/register" className="bg-white text-purple-600 px-6 py-3 rounded-full font-semibold flex items-center hover:bg-purple-100 transition duration-300">
            <FaUserPlus className="mr-2" />
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Hero;
