import { initializeApp } from 'firebase/app';
import { useState, useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { getDatabase, ref, onValue, update, remove, set, get } from 'firebase/database';

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

const Page2 = ({ searchQuery }) => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '' });

    useEffect(() => {
        const acceptedRef = ref(database, 'Accepted');
        const unsubscribe = onValue(acceptedRef, snapshot => {
            if (snapshot.exists()) {
                setData(snapshot.val());
            } else {
                setData({});
            }
            setLoading(false);
        });

        return () => unsubscribe(); // Cleanup listener
    }, []);

    const acceptStudent = (studentId, strand) => {
        const acceptedRef = ref(database, `Accepted/${strand}/${studentId}`);
        const interviewedRef = ref(database, `Interviewed/${strand}/${studentId}`);

        get(acceptedRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const studentData = snapshot.val();
                    return set(interviewedRef, {
                        ...studentData,
                        status: 'For Document Review',
                        interviewDate: new Date().toISOString(),
                    }).then(() => remove(acceptedRef));
                } else {
                    throw new Error("Student data not found.");
                }
            })
            .then(() => {
                setModalContent({
                    title: 'Success',
                    message: 'Student moved to document review successfully!',
                });
                setModalOpen(true);
            })
            .catch((error) => {
                console.error("Error in transfer:", error);
                setModalContent({
                    title: 'Error',
                    message: 'An error occurred while moving the student. Please try again.',
                });
                setModalOpen(true);
            });
    };

    const filterStudents = (students) => {
        if (!searchQuery) return Object.entries(students);
        return Object.entries(students).filter(([id, student]) => {
            const searchFields = [
                student.fullName,
                student.email,
                student.phoneNumber,
                student.trackingNumber,
                student.guardianName,
                student.guardianContact,
            ];
            return searchFields.some(
                (field) => field && field.toLowerCase().includes(searchQuery.toLowerCase())
            );
        });
    };

    const generateTableHtml = (strand, data) => {
        if (!data || Object.keys(data).length === 0) {
            return <div className="text-center text-gray-500">No data available for {strand}</div>;
        }

        const filteredData = filterStudents(data);

        if (filteredData.length === 0) {
            return <div className="text-center text-gray-500">No matching students found for {strand}</div>;
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
                    {filteredData.map(([id, student]) => (
                        <tr key={id} className="border-b border-gray-200">
                            <td className="px-6 py-4">{student.fullName || "N/A"}</td>
                            <td className="px-6 py-4">{student.email || "N/A"}</td>
                            <td className="px-6 py-4">{student.phoneNumber || "N/A"}</td>
                            <td className="px-6 py-4">{student.gradeLevel || "N/A"}</td>
                            <td className="px-6 py-4">{student.trackingNumber || "N/A"}</td>
                            <td className="px-6 py-4">
                                {student.guardianName || "N/A"} ({student.guardianContact || "N/A"})
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button
                                    className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition flex items-center justify-center space-x-2"
                                    onClick={() => acceptStudent(id, strand)}
                                >
                                    <FaCheckCircle className="mr-2" />
                                    Accept
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4">
            <header className="bg-gray-800 text-white text-center py-4 text-xl font-bold">
                Students Ready for Interview
            </header>
            <main className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6 mt-6">
                <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
                    Students Ready for Interview Overview
                </h1>
                {loading ? (
                    <div className="text-center text-gray-500">Loading...</div>
                ) : (
                    Object.keys(data).map((strand) => generateTableHtml(strand, data[strand]))
                )}
            </main>
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalContent.title}
                message={modalContent.message}
            />
        </div>
    );
};

export default Page2;
