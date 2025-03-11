import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaUserPlus, FaClipboardList, FaChartLine } from 'react-icons/fa';
import StrandContainer from '../components/StrandContiner';

const Home = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const steps = [
    { icon: <FaUserPlus />, title: "Register", description: "Create an account to start your enrollment process." },
    { icon: <FaClipboardList />, title: "Fill Form", description: "Complete the enrollment form with your details." },
    { icon: <FaChartLine />, title: "Track Progress", description: "Monitor your enrollment status in real-time." }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <main className="container mx-auto px-4 py-12">
        <motion.section {...fadeIn} className="mb-16">
          <h2 className="text-3xl font-semibold text-center mb-8">How to Enroll</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-4xl text-blue-500 mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section {...fadeIn} className="text-center">
          <h2 className="text-3xl font-semibold mb-6">Ready to Get Started?</h2>
          <Link 
            to="/register" 
            className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition duration-300"
          >
            Enroll Now
          </Link>
        </motion.section>

        <motion.section {...fadeIn} className="mt-16">
          <h2 className="text-3xl font-semibold text-center mb-8">Why Choose PWC?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">Quality Education</h3>
              <p className="text-gray-600">Experience top-notch learning with our expert faculty and modern facilities.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">Career Opportunities</h3>
              <p className="text-gray-600">Gain access to exclusive internships and job placements with industry leaders.</p>
            </div>
          </div>
        </motion.section>

        {/* Footer - About the Developer */}
        <footer className="mt-16 py-8 bg-blue-50">
          <motion.section {...fadeIn} className="text-center">
            <h2 className="text-2xl font-semibold mb-4">About the Developer</h2>
            <p className="text-gray-600 mb-4">
              This Wibesite was developed by Prince A. Estrada, a software developer with a focus on creating user-friendly and efficient web applications.
            </p>
            <a 
              href="https://web.facebook.com/profile.php?id=100095278806621" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700 transition duration-300"
            >
              Visit on Facebook
            </a>
          </motion.section>

          
        </footer>
      </main>
    </div>
  );
};

export default Home;