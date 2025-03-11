import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaFileAlt, FaEye, FaTimes } from 'react-icons/fa';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, get, remove } from 'firebase/database';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';

// Firebase configuration
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
const storage = getStorage(app);

const STRANDS = [
    'STEM', 'HUMMS', 'ABM', 'TVL-ICT Programming', 'TVL-ICT CSS',
    'TVL-ICT Animation', 'TVL-Industrial Arts', 'TVL-Home Economics',
    'TVL-Fashion Design', 'A&D Multimedia Arts', 'A&D Performing Arts'
];
const Dashboard3 = ({ searchQuery }) => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [documentUrls, setDocumentUrls] = useState({
        form137Url: false,
        birthCertificateUrl: false,
        goodMoralUrl: false
    });

    const strands = [
        'STEM', 'HUMMS', 'ABM', 'TVL-ICT Programming', 'TVL-ICT CSS', 
        'TVL-ICT Animation', 'TVL-Industrial Arts', 'TVL-Home Economics',
        'TVL-Fashion Design', 'A&D Multimedia Arts', 'A&D Performing Arts'
    ];

    useEffect(() => {
        console.log("Fetching data from Interviewed collection...");
        const interviewedRef = ref(database, 'Interviewed');

        const unsubscribe = onValue(interviewedRef, (snapshot) => {
            console.log("Data snapshot received:", snapshot.val());
            if (snapshot.exists()) {
                setData(snapshot.val());
            } else {
                // Initialize empty data structure for all strands
                const emptyData = {};
                strands.forEach(strand => {
                    emptyData[strand] = {};
                });
                setData(emptyData);
            }
            setLoading(false);
        }, (error) => {
            console.error("Database error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filterStudents = (students) => {
        if (!searchQuery) return Object.entries(students);
        return Object.entries(students).filter(([_, student]) => {
            const searchFields = [
                student.fullName,
                student.email,
                student.phoneNumber,
                student.trackingNumber,
                student.guardianName,
                student.guardianContact
            ];
            return searchFields.some(field => 
                field && field.toLowerCase().includes(searchQuery.toLowerCase())
            );
        });
    };

    const handleReviewDocuments = (student) => {
        console.log("Opening document review for:", student);
        setSelectedStudent(student);
        setShowDocumentModal(true);
    };

    const ImageModal = ({ imageUrl, onClose }) => {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="relative max-w-4xl w-full mx-4">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 text-xl"
                    >
                        <FaTimes />
                    </button>
                    <img
                        src={imageUrl}
                        alt="Document Preview"
                        className="max-w-full max-h-[80vh] object-contain mx-auto"
                    />
                </div>
            </div>
        );
    };

    const DocumentModal = ({ student, onClose }) => {
        const [loading, setLoading] = useState(true);

        const [documentUrls, setDocumentUrls] = useState({
            form137Url: false,
            birthCertificateUrl: false,
            goodMoralUrl: false,
        });

        const [isSubmitting, setIsSubmitting] = useState(false);

        useEffect(() => {
            const loadDocuments = async () => {
                try {
                    setLoading(true);
                    const storage = getStorage();
                    
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
                } finally {
                    setLoading(false);
                }
            };

            if (student) {
                loadDocuments();
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

        const handleApproveDocuments = async (student) => {
            try {
                console.log('Starting document approval process for:', student);

                // Verify we have the student data
                if (!student || !student.trackingNumber || !student.strand) {
                    throw new Error('Invalid student data');
                }

                // Reference to the source path (Interviewed)
                const sourceRef = ref(database, `Interviewed/${student.strand}/${student.trackingNumber}`);

                // Reference to the destination path (FinalReview)
                const finalReviewRef = ref(database, `FinalReview/${student.strand}/${student.trackingNumber}`);

                // Retrieve the student data from Interviewed (Source)
                const snapshot = await get(sourceRef);
                console.log("snapshot: " , snapshot);
                if (snapshot.exists()) {
                    const data = snapshot.val(); // Get the student data

                    console.log("Data being written to FinalReview:", data);  // Log the data to check

                    // Write the data to FinalReview (Destination), update status and date
                    const writeResult = await set(finalReviewRef, {
                        ...data,  // Spread existing student data
                        status: 'For Final Review', // Updated status
                        documentApprovalDate: new Date().toISOString()  // Updated document approval date
                    }).catch((error) => {
                        console.error('Firebase write failed: ', error);  // Log specific Firebase write errors
                    });
                    const r = await remove(sourceRef);
                    handleCloseDocumentModal();

                } else {
                    console.log("No data found at the source path.");
                    alert('No data found to move.');
                }

            } catch (error) {
                console.error('Error in handleApproveDocuments:', error);
                alert('Error accepting documents: ' + error.message);
            }
        };

        const handleAcceptClick = async () => {
            setIsSubmitting(true);
            try {
                await handleApproveDocuments(student);
            } finally {
                setIsSubmitting(false);
            }
        };

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
                            Document Review - {student.fullName}
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
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                disabled={isSubmitting}
                            >
                                Close
                            </button>
                            <button
                                onClick={handleAcceptClick}
                                className={`px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center ${
                                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <FaCheckCircle className="mr-2" />
                                        Accept Documents
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const generateTableHtml = (strand, strandData) => {
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
                            <th className="px-6 py-4 text-center">Documents</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(strandData).map(([id, student]) => (
                            <tr key={id} className="border-b border-gray-200">
                                <td className="px-6 py-4">{student.fullName}</td>
                                <td className="px-6 py-4">{student.email}</td>
                                <td className="px-6 py-4">{student.phoneNumber}</td>
                                <td className="px-6 py-4">{student.gradeLevel}</td>
                                <td className="px-6 py-4">{student.trackingNumber}</td>
                                <td className="px-6 py-4">
                                    {student.guardianName} ({student.guardianContact})
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => handleReviewDocuments(student)}
                                        className={`px-4 py-2 ${student.documentsSubmitted 
                                            ? 'bg-blue-500 hover:bg-blue-600' 
                                            : 'bg-gray-400'} 
                                            text-white rounded-full transition flex items-center justify-center mx-auto`}
                                        disabled={!student.documentsSubmitted}
                                    >
                                        <FaFileAlt className="mr-2" />
                                        {student.documentsSubmitted ? 'Review Documents' : 'No Documents'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // Function to handle closing the document modal
    const handleCloseDocumentModal = () => {
        console.log("Closing document modal");
        setShowDocumentModal(false);
        setSelectedStudent(null);
        setDocumentUrls({
            form137: null,
            birthCertificate: null,
            goodMoral: null
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4">
            <header className="bg-gray-800 text-white text-center py-4 text-xl font-bold">
                Document Review
            </header>
            <main className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6 mt-6">
                <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
                    Students For Document Review
                </h1>
                {loading ? (
                    <div className="text-center text-gray-500">Loading...</div>
                ) : Object.keys(data).length === 0 ? (
                    <div className="text-center text-gray-500 p-4">
                        No students waiting for document review
                    </div>
                ) : (
                    Object.entries(data).map(([strand, strandData]) => 
                        generateTableHtml(strand, strandData)
                    )
                )}
            </main>
            
            {/* Document Modal */}
            {showDocumentModal && (
                <DocumentModal
                    student={selectedStudent}
                    onClose={handleCloseDocumentModal}
                />
            )}

            {/* Image Modal */}
            {showImageModal && (
                <ImageModal
                    imageUrl={selectedImage}
                    onClose={() => {
                        setShowImageModal(false);
                        setSelectedImage(null);
                    }}
                />
            )}
        </div>
    );
};

export default Dashboard3;