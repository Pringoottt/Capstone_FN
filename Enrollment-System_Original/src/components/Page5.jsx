import { initializeApp } from 'firebase/app';
import React, { useState, useEffect } from 'react';
import {FaEye, FaFileAlt, FaTimes} from 'react-icons/fa';
import {getDatabase, ref, onValue} from 'firebase/database';

// Firebase Config
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const Page5 = () => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        const fetchData = () => {
            setLoading(true);
            const strands = [
                "STEM", "HUMS", "ABM", "TVL-ICT Programming",
                "TVL-ICT CSS", "TVL-ICT Animation", "TVL-Industrial Arts",
                "TVL-Travel Services", "TVL-Home Economics", "TVL-Fashion Design",
                "A&D Multimedia Arts", "A&D Performing Arts"
            ];

            strands.forEach(strand => {
                const Dashboard5Ref = ref(database, `Enrolled/${strand}`);
                onValue(Dashboard5Ref, snapshot => {
                    if (snapshot.exists()) {
                        setData(prevData => ({
                            ...prevData,
                            [strand]: snapshot.val()
                        }));
                    }
                });
            });
            setLoading(false);
        };

        fetchData();
    }, []);

    const handleViewDocuments = async (student) => {
        setSelectedStudent(student);
        setShowDocumentModal(true);
    };

    const handleCloseDocumentModal = () => {
        console.log("Closing document modal");
        setShowDocumentModal(false);
        setSelectedStudent(null);
    };

    const DocumentModal = ({ student, onClose }) => {
        const [documentUrls, setDocumentUrls] = useState({
            form137Url: false,
            birthCertificateUrl: false,
            goodMoralUrl: false,
        });

        useEffect(() => {
            const loadDocuments = async () => {
                try {
                    // Get Form 137 URL
                    if (student.form137Url) {
                        setDocumentUrls(prev => ({ ...prev, form137Url: true  }));
                    }

                    // Get Birth Certificate URL
                    if (student.birthCertificateUrl) {
                        setDocumentUrls(prev => ({ ...prev, birthCertificateUrl: true  }));
                    }

                    // Get Good Moral URL
                    if (student.goodMoralUrl) {
                        setDocumentUrls(prev => ({ ...prev, goodMoralUrl: true  }));
                    }

                } catch (error) {
                    console.error('Error loading documents:', error);
                    alert('Error loading documents. Please try again.');
                }
            };

            if (student) {
                loadDocuments().then(() => {});
            }
        }, [student]);

        const base64ToBlob = (base64String, contentType) => {
            // Remove the data URL prefix if present
            const base64Data = base64String.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteArrays = [];

            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);
                const byteNumbers = new Array(slice.length);

                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }

            return new Blob(byteArrays, { type: contentType });
        };

        const handleViewDocument = (url, documentType) => {
            if (url) {
                let base64Data = null;
                let contentType = "image/png";
                if(documentType === "Good Moral") {
                    base64Data = selectedStudent.goodMoralUrl;
                } else if (documentType === "Form 137") {
                    base64Data = selectedStudent.form137Url;
                } else if (documentType === "Birth Certificate") {
                    base64Data = selectedStudent.birthCertificateUrl;
                }
                if(base64Data) {
                    const contentTypeMatch = base64Data.match(/^data:(.*?);base64,/);
                    if(contentTypeMatch) {
                        contentType = contentTypeMatch[1];
                    }
                }

                const blob = base64ToBlob(base64Data, contentType);
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
            } else {
                alert(`No ${documentType} uploaded yet.`);
            }
        };

        const toProperCase = (str) => {
            return str
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        };


        // Document Modals
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    >
                        <FaTimes size={24} />
                    </button>

                    {/* Modal content */}
                    <div className="mt-2">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Document Review - {toProperCase(student.fullName)}
                        </h2>

                        {/* Student Information */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h3 className="text-lg font-semibold mb-3">Student Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <p><strong>Email:</strong> {student.email}</p>
                                <p><strong>Phone:</strong> {student.phoneNumber}</p>
                                <p><strong>Grade Level:</strong> {student.gradeLevel}</p>
                                <p><strong>Tracking Number:</strong> {student.trackingNumber}</p>
                                <p><strong>Guardian:</strong> {student.guardianName}</p>
                                <p><strong>Guardian Contact:</strong> {student.guardianContact}</p>
                            </div>
                        </div>

                        {/* Documents Section */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Submitted Documents</h3>

                            {/* Form 137 */}
                            <div className="mb-4 p-4 border rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FaFileAlt className="text-blue-500 mr-3" />
                                        <span className="font-medium">Form 137</span>
                                    </div>
                                    <button
                                        onClick={() => handleViewDocument(documentUrls.form137Url, 'Form 137')}
                                        className={`px-3 py-1 ${documentUrls.form137Url ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400'} text-white rounded-md flex items-center`}
                                        disabled={!documentUrls.form137Url}
                                    >
                                        <FaEye className="mr-2" />
                                        View
                                    </button>
                                </div>
                            </div>

                            {/* Birth Certificate */}
                            <div className="mb-4 p-4 border rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FaFileAlt className="text-blue-500 mr-3" />
                                        <span className="font-medium">Birth Certificate</span>
                                    </div>
                                    <button
                                        onClick={() => handleViewDocument(documentUrls.birthCertificateUrl, 'Birth Certificate')}
                                        className={`px-3 py-1 ${documentUrls.birthCertificateUrl ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400'} text-white rounded-md flex items-center`}
                                        disabled={!documentUrls.birthCertificateUrl}
                                    >
                                        <FaEye className="mr-2" />
                                        View
                                    </button>
                                </div>
                            </div>

                            {/* Good Moral */}
                            <div className="mb-4 p-4 border rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FaFileAlt className="text-blue-500 mr-3" />
                                        <span className="font-medium">Good Moral Certificate</span>
                                    </div>
                                    <button
                                        onClick={() => handleViewDocument(documentUrls.goodMoralUrl, 'Good Moral')}
                                        className={`px-3 py-1 ${documentUrls.goodMoralUrl ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400'} text-white rounded-md flex items-center`}
                                        disabled={!documentUrls.goodMoralUrl}
                                    >
                                        <FaEye className="mr-2" />
                                        View
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 mt-6">
                            <button onClick={onClose} className="px-4 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-800">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4">
            <header className="bg-gray-800 text-white text-center py-4 text-xl font-bold">
                Sectioning Panel
            </header>

            <main className="max-w-7xl mx-auto mt-6">
                {loading ? (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4">Loading...</p>
                    </div>
                ) : (
                    Object.entries(data).map(([strand, students]) => {
                        // Group students by section
                        const studentsBySection = {};
                        Object.entries(students).forEach(([id, student]) => {
                            const section = student.section || "1"; // Default to Section 1
                            if (!studentsBySection[section]) {
                                studentsBySection[section] = [];
                            }
                            studentsBySection[section].push({ id, ...student });
                        });

                        return (
                            <div key={strand} className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="bg-gray-800 text-white px-6 py-4">
                                    <h2 className="text-xl font-semibold">{strand}</h2>
                                </div>

                                {Object.entries(studentsBySection).map(([section, sectionStudents]) => (
                                    <div key={section} className="mb-6">
                                        <div className="bg-gray-100 px-6 py-2">
                                            <h3 className="text-lg font-medium">Section {section}</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Student Details
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Contact Info
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Documents
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Section
                                                    </th>
                                                </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                {sectionStudents.map((student) => (
                                                    <tr key={student.id}>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                                                            <div className="text-sm text-gray-500">ID: {student.trackingNumber}</div>
                                                            <div className="text-sm text-gray-500">{student.gradeLevel}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-gray-900">{student.email}</div>
                                                            <div className="text-sm text-gray-500">{student.phoneNumber}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => handleViewDocuments(student)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                View Documents
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4">Section {section}</td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })
                )}
            </main>
            {/* Document Modal */}
            {showDocumentModal && (
                <DocumentModal student={selectedStudent} onClose={handleCloseDocumentModal} />
            )}
        </div>
    );


    // return (
    //     <div className="min-h-screen bg-gray-100 py-6 px-4">
    //         <header className="bg-gray-800 text-white text-center py-4 text-xl font-bold">
    //             Sectioning Panel
    //         </header>
    //
    //         <main className="max-w-7xl mx-auto mt-6">
    //             {loading ? (
    //                 <div className="text-center">
    //                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
    //                     <p className="mt-4">Loading...</p>
    //                 </div>
    //             ) : (
    //                 Object.entries(data).map(([strand, students]) => (
    //                     students && Object.keys(students).length > 0 && (
    //                         <div key={strand} className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
    //                             <div className="bg-gray-800 text-white px-6 py-4">
    //                                 <h2 className="text-xl font-semibold">{strand}</h2>
    //                             </div>
    //
    //                             <div className="overflow-x-auto">
    //                                 <table className="min-w-full divide-y divide-gray-200">
    //                                     <thead className="bg-gray-50">
    //                                     <tr>
    //                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                                             Student Details
    //                                         </th>
    //                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                                             Contact Info
    //                                         </th>
    //                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                                             Documents
    //                                         </th>
    //                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                                             Section
    //                                         </th>
    //                                     </tr>
    //                                     </thead>
    //                                     <tbody className="bg-white divide-y divide-gray-200">
    //                                     {Object.entries(students).map(([id, student]) => (
    //                                         <tr key={id}>
    //                                             <td className="px-6 py-4">
    //                                                 <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
    //                                                 <div className="text-sm text-gray-500">ID: {student.trackingNumber}</div>
    //                                                 <div className="text-sm text-gray-500">{student.gradeLevel}</div>
    //                                             </td>
    //                                             <td className="px-6 py-4">
    //                                                 <div className="text-sm text-gray-900">{student.email}</div>
    //                                                 <div className="text-sm text-gray-500">{student.phoneNumber}</div>
    //                                             </td>
    //                                             <td className="px-6 py-4">
    //                                                 <button
    //                                                     onClick={() => handleViewDocuments(student)}
    //                                                     className="text-blue-600 hover:text-blue-900"
    //                                                 >
    //                                                     View Documents
    //                                                 </button>
    //                                             </td>
    //                                             <td className="px-6 py-4">
    //                                                 Section {student.section ?? 1}
    //                                             </td>
    //
    //                                         </tr>
    //                                     ))}
    //                                     </tbody>
    //                                 </table>
    //                             </div>
    //                         </div>
    //                     )
    //                 ))
    //             )}
    //         </main>
    //         {/* Document Modal */}
    //         {showDocumentModal && (
    //             <DocumentModal
    //                 student={selectedStudent}
    //                 onClose={handleCloseDocumentModal}
    //             />
    //         )}
    //     </div>
    // );


};

export default Page5;