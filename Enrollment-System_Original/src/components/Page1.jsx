import { initializeApp } from 'firebase/app';
import { useState, useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { getDatabase, ref, onValue, update, remove } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBumwzJovrCtswna3TkgxRjqEOXweNdqpg",
  authDomain: "capstone-b3ceb.firebaseapp.com",
  databaseURL: "https://capstone-b3ceb-default-rtdb.firebaseio.com",
  projectId: "capstone-b3ceb",
  storageBucket: "capstone-b3ceb.appspot.com",
  messagingSenderId: "722295223378",
  appId: "1:722295223378:web:d3fb1f7a77d7db620b1b8b",
  measurementId: "G-BRYKFRYWPZ"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Modal Component
const Modal = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-96 p-6">
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <p className="text-gray-700 mb-6">{message}</p>
          <button
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
  );
};

const Page1 = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  const fetchData = () => {
    const strands = [
      "STEM", "HUMS", "ABM", "TVL-ICT Programming",
      "TVL-ICT CSS", "TVL-ICT Animation", "TVL-Industrial Arts",
      "TVL-Travel Services", "TVL-Home Economics", "TVL-Fashion Design",
      "A&D Multimedia Arts", "A&D Performing Arts"
    ];

    let allData = {};

    strands.forEach(strand => {
      const strandRef = ref(database, strand);
      onValue(strandRef, snapshot => {
        if (snapshot.exists()) {
          allData[strand] = snapshot.val();
          setData((prevData) => ({ ...prevData, ...allData }));
        } else {
          setData((prevData) => ({
            ...prevData,
            [strand]: "No data available"
          }));
        }
      });
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const acceptStudent = (studentId, strand) => {
    const studentRef = ref(database, `${strand}/${studentId}`);
    const acceptedRef = ref(database, `Accepted/${strand}/${studentId}`);

    onValue(studentRef, snapshot => {
      if (snapshot.exists()) {
        const studentData = snapshot.val();
        update(acceptedRef, studentData)
            .then(() => {
              remove(studentRef).then(() => {
                setModalContent({
                  title: "Success!",
                  message: `Student has been successfully accepted into ${strand}.`
                });
                setModalOpen(true);
              });
            })
            .catch(error => {
              console.error("Error moving student:", error);
              setModalContent({
                title: "Error",
                message: "An error occurred while accepting the student. Please try again."
              });
              setModalOpen(true);
            });
      }
    });
  };

  const closeModal = () => {
    setModalOpen(false);
    setLoading(true); // Show loading before data is refreshed
    fetchData(); // Refresh data when the modal closes
  };

  const generateTableHtml = (strand, data) => {
    if (data === "No data available") {
      return <div className="text-center text-gray-500">No data available for {strand}</div>;
    }

    return (
        <div key={strand} className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 my-4">{strand}</h2>
          <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
            <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-6 py-4 text-left">Full Name</th>
              <th className="px-6 py-4 text-left">Email</th>
              <th className="px-6 py-4 text-left">Phone</th>
              <th className="px-6 py-4 text-left">Grade Level</th>
              <th className="px-6 py-4 text-left">Tracking No.</th>
              <th className="px-6 py-4 text-left">Guardian</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
            </thead>
            <tbody>
            {Object.keys(data).map((id) => {
              const student = data[id];
              return (
                  <tr key={id} className="border-b border-gray-200">
                    <td className="px-6 py-4">{student.fullName || "N/A"}</td>
                    <td className="px-6 py-4">{student.email || "N/A"}</td>
                    <td className="px-6 py-4">{student.phoneNumber || "N/A"}</td>
                    <td className="px-6 py-4">{student.gradeLevel || "N/A"}</td>
                    <td className="px-6 py-4">{student.trackingNumber || "N/A"}</td>
                    <td className="px-6 py-4">{student.guardianName || "N/A"} ({student.guardianContact || "N/A"})</td>
                    <td className="px-6 py-4 text-center">
                      <button
                          className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
                          onClick={() => acceptStudent(id, strand)}
                      >
                        <FaCheckCircle className="mr-2" /> Accept
                      </button>
                    </td>
                  </tr>
              );
            })}
            </tbody>
          </table>
        </div>
    );
  };

  return (
      <div className="min-h-screen bg-gray-100 py-6 px-4">
        <header className="bg-gray-800 text-white text-center py-4 text-xl font-bold">Admin Panel - Enrollment Data</header>
        <main className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6 mt-6">
          <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">Enrollment Data Overview</h1>
          {loading ? (
              <div className="text-center text-gray-500">Loading...</div>
          ) : (
              Object.keys(data).map((strand) => generateTableHtml(strand, data[strand]))
          )}
        </main>
        <Modal
            isOpen={modalOpen}
            onClose={closeModal}
            title={modalContent.title}
            message={modalContent.message}
        />
      </div>
  );
};

export default Page1;





