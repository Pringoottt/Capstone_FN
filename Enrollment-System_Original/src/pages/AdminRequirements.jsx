import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { Link } from 'react-router-dom';

function AdminRequirements() {
    const [requirementsStudents, setRequirementsStudents] = useState([]);

    useEffect(() => {
        const database = getDatabase();
        // Clear previous students before fetching
        setRequirementsStudents([]);
        
        const strands = ["STEM", "HUMS", "ABM", "TVL-ICT Programming", /* ... other strands ... */];
        
        strands.forEach(strand => {
            const strandRef = ref(database, strand);
            onValue(strandRef, (snapshot) => {
                if (snapshot.exists()) {
                    const students = snapshot.val();
                    const approvedStudentsArray = Object.entries(students)
                        .map(([key, student]) => ({
                            ...student,
                            strand,
                            key
                        }))
                        .filter(student => 
                            student.isApproved && 
                            student.currentStep === 'requirements' && 
                            !student.requirementsSubmitted
                        );

                    setRequirementsStudents(current => {
                        // Create a new array with unique students based on trackingNumber
                        const existingTrackingNumbers = new Set(current.map(s => s.trackingNumber));
                        const newStudents = approvedStudentsArray.filter(
                            student => !existingTrackingNumbers.has(student.trackingNumber)
                        );
                        return [...current, ...newStudents];
                    });
                }
            });
        });
    }, []);

    const handleRequirementsApproval = async (student) => {
        const database = getDatabase();
        const studentRef = ref(database, `${student.strand}/${student.trackingNumber}`);
        
        try {
            await update(studentRef, {
                requirementsSubmitted: true,
                currentStep: 'payment',
                enrollmentStatus: 'Requirements Approved',
                requirementsApprovalDate: new Date().toISOString()
            });
            
            // Remove the student from requirementsStudents
            setRequirementsStudents(current => 
                current.filter(s => s.trackingNumber !== student.trackingNumber)
            );
            
            alert('Requirements approved successfully!');
        } catch (error) {
            console.error('Error approving requirements:', error);
            alert('Error approving requirements. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Requirements Submission</h1>
                    <Link to="/admin" className="text-blue-600 hover:underline">
                        Back to Admin Dashboard
                    </Link>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Students Pending Requirements</h2>
                    {requirementsStudents.length > 0 ? (
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
                                {requirementsStudents.map((student) => (
                                    <tr key={student.trackingNumber} className="border-t">
                                        <td className="px-6 py-4">{student.fullName}</td>
                                        <td className="px-6 py-4">{student.strand}</td>
                                        <td className="px-6 py-4">{student.gradeLevel}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleRequirementsApproval(student)}
                                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                            >
                                                Approve Requirements
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-500">No students pending requirements approval</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminRequirements;