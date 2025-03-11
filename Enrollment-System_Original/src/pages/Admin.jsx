import React, { useState, useEffect } from 'react';
import Login from '../components/Login';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { Link } from 'react-router-dom';

function Admin() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [pendingStudents, setPendingStudents] = useState([]);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    useEffect(() => {
        if (isLoggedIn) {
            const database = getDatabase();
            // Clear previous pending students before fetching
            setPendingStudents([]);
            
            const strands = ["STEM", "HUMS", "ABM", "TVL-ICT Programming", /* ... other strands ... */];
            
            strands.forEach(strand => {
                const strandRef = ref(database, strand);
                onValue(strandRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const students = snapshot.val();
                        const pendingStudentsArray = Object.entries(students)
                            .map(([key, student]) => ({
                                ...student,
                                strand,
                                key
                            }))
                            .filter(student => !student.isApproved && !student.currentStep); // Only get students who aren't approved

                        setPendingStudents(current => {
                            // Create a new array with unique students based on trackingNumber
                            const existingTrackingNumbers = new Set(current.map(s => s.trackingNumber));
                            const newStudents = pendingStudentsArray.filter(
                                student => !existingTrackingNumbers.has(student.trackingNumber)
                            );
                            return [...current, ...newStudents];
                        });
                    }
                });
            });
        }
    }, [isLoggedIn]);

    const handleApproveStudent = async (student) => {
        const database = getDatabase();
        const studentRef = ref(database, `${student.strand}/${student.trackingNumber}`);
        
        try {
            await update(studentRef, {
                isApproved: true,
                enrollmentStatus: 'Requirements Pending',
                currentStep: 'requirements',
                approvalDate: new Date().toISOString()
            });
            
            // Remove the student from pendingStudents
            setPendingStudents(current => 
                current.filter(s => s.trackingNumber !== student.trackingNumber)
            );
            
            alert('Student approved successfully!');
        } catch (error) {
            console.error('Error approving student:', error);
            alert('Error approving student. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {isLoggedIn ? (
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                        <Link to="/admin/requirements" className="text-blue-600 hover:underline">
                            View Requirements Submission
                        </Link>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Pending Enrollments</h2>
                        {pendingStudents.length > 0 ? (
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-3 text-left">Name</th>
                                        <th className="px-6 py-3 text-left">Strand</th>
                                        <th className="px-6 py-3 text-left">Grade Level</th>
                                        <th className="px-6 py-3 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingStudents.map((student) => (
                                        <tr key={student.trackingNumber} className="border-t">
                                            <td className="px-6 py-4">{student.fullName}</td>
                                            <td className="px-6 py-4">{student.strand}</td>
                                            <td className="px-6 py-4">{student.gradeLevel}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleApproveStudent(student)}
                                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                                >
                                                    Approve
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-500">No pending enrollments</p>
                        )}
                    </div>
                </div>
            ) : (
                <Login onLogin={handleLogin} />
            )}
        </div>
    );
}

export default Admin;
