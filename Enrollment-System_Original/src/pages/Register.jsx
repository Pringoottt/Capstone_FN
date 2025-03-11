import { initializeApp } from 'firebase/app';
import { useState, useEffect } from 'react';
import { getDatabase, ref, set, onValue, get, query, orderByChild, equalTo } from 'firebase/database';
import { FaFileUpload } from 'react-icons/fa';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import Swal from 'sweetalert2';

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

// Check initial registration (Dashboard)
const STRANDS = [
    'STEM', 'HUMMS', 'ABM', 'TVL-ICT Programming', 'TVL-ICT CSS',
    'TVL-ICT Animation', 'TVL-Industrial Arts', 'TVL-Home Economics',
    'TVL-Fashion Design', 'A&D Multimedia Arts', 'A&D Performing Arts'
];

const CombinedForm = () => {
    const [activeTab, setActiveTab] = useState('enrollment'); // Track active tab
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [gradeLevel, setGradeLevel] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [guardianName, setGuardianName] = useState('');
    const [guardianContact, setGuardianContact] = useState('');
    const [strand, setStrand] = useState('STEM');
    const [status, setStatus] = useState('');
    const [studentData, setStudentData] = useState(null);
    const [allData, setAllData] = useState({});
    const [loading, setLoading] = useState(true);
    const [trackingSearch, setTrackingSearch] = useState('');
    const [enrollmentStatus, setEnrollmentStatus] = useState(''); // New state for enrollment status
    const [adminApproved, setAdminApproved] = useState(false);
    const [dashboard2Data, setDashboard2Data] = useState([]); // Add this state
    const [showModal, setShowModal] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState({
        form137Url: null,
        birthCertificateUrl: null,
        goodMoralUrl: null
    });
    const [showDocumentModal, setShowDocumentModal] = useState(false);

    // Handle enrollment form submission
    const generateTrackingNumber = () => {
        const timestamp = Date.now();  // Get the current timestamp (milliseconds)
        const randomNumber = Math.random().toString(36).substr(2, 9).toUpperCase();  // Generate a random alphanumeric string
        return `TRACK-${timestamp}-${randomNumber}`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newTrackingNumber = generateTrackingNumber();
        setTrackingNumber(newTrackingNumber);
    
        const studentRef = ref(database, `${strand}/${newTrackingNumber}`);
        set(studentRef, {
            fullName,
            email,
            phoneNumber,
            gradeLevel,
            trackingNumber: newTrackingNumber,
            guardianName,
            guardianContact,
            enrollmentStatus: 'Ongoing',
            enrollmentDate: new Date().toISOString(),
            isApproved: false,
        }).then(() => {
            // Show success message and tracking number alert
            setStatus('Student registration submitted successfully!');
            setEnrollmentStatus('Ongoing');
    
            // SweetAlert for success
            Swal.fire({
                title: 'Registration Successful!',
                html: `IMPORTANT: Please take note of your tracking number:<br><strong>${newTrackingNumber}</strong><br><br>This number is required to monitor your enrollment status. Please keep it safe!`,
                icon: 'success',
                confirmButtonText: 'OK'
            });
    
            // Clear form fields after successful submission
            setFullName('');
            setEmail('');
            setPhoneNumber('');
            setGradeLevel('Grade 11');
            setGuardianName('');
            setGuardianContact('');
            setStrand('STEM');
            setTrackingNumber('');
    
        }).catch((error) => {
            setStatus('Error submitting registration: ' + error.message);
            setEnrollmentStatus('Error occurred during registration');
    
            // SweetAlert for error
            Swal.fire({
                title: 'Error!',
                text: 'Error submitting form. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        });
    };
    
    const handleSearch = async () => {
        try {
            setLoading(true);
            let foundStudent = null;
    
            // Function to check a specific collection
            const checkCollections = async () => {
                const REGISTRATION_STATUS = [
                    'Accepted',
                    'Interviewed',
                    'FinalReview',
                    'Enrolled',
                    'Rejected',
                ];
    
                for (const status of REGISTRATION_STATUS) {
                    console.log(status);
                    let returnStatus = "";
                    if (status === "Accepted") {
                        returnStatus = "Please take a interview with the strand coordinator in your chosen strand";
                    } else if (status === "Interviewed") {
                        returnStatus = "For Document Review";
                    } else if (status === "FinalReview") {
                        returnStatus = "For Final Document Review";
                    } else if (status === "Enrolled") {
                        returnStatus = "Enrolled";
                    } else if (status === "Rejected") {
                        returnStatus = "Rejected";
                    }
    
                    const status_reference = ref(database, status);
                    const status_result = await get(status_reference);
    
                    if (status_result.exists()) {
                        const acceptedData = status_result.val();
                        for (let strand in acceptedData) {
                            for (let studentId in acceptedData[strand]) {
                                if (acceptedData[strand][studentId].trackingNumber === trackingSearch) {
                                    return {
                                        ...acceptedData[strand][studentId],
                                        enrollmentStatus: returnStatus,
                                        strand: strand
                                    };
                                }
                            }
                        }
                    }
                }
    
                for (const strand of STRANDS) {
                    const strandRef = ref(database, strand);
                    const snapshot = await get(strandRef);
    
                    if (snapshot.exists()) {
                        const strandData = snapshot.val();
                        for (let studentId in strandData) {
                            if (strandData[studentId].trackingNumber === trackingSearch) {
                                console.log(strandData);
                                return {
                                    ...strandData[studentId],
                                    enrollmentStatus: 'For Interest Test',
                                    strand: strand
                                };
                            }
                        }
                    }
                }
    
                return null;
            };
    
            // Search for student
            foundStudent = await checkCollections();
    
            if (foundStudent) {
                console.log('Found student:', foundStudent);
                setStudentData(foundStudent);
            } else {
                console.log('No student found with tracking number:', trackingSearch);
    
                // SweetAlert for no student found
                Swal.fire({
                    title: 'Not Found!',
                    text: 'No student found with this tracking number.',
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
    
                setStudentData(null);
            }
        } catch (error) {
            console.error('Error searching for student:', error);
    
            // SweetAlert for error
            Swal.fire({
                title: 'Error!',
                text: 'Error searching for student. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    const determineStatus = (student) => {
        if (student.isApproved && student.currentStep === 'requirements') {
            return 'Requirements Pending';
        } else if (student.requirementsSubmitted && student.currentStep === 'payment') {
            return 'Payment Pending';
        } else if (student.paymentSubmitted || student.currentStep === 'enrolled') {
            return 'Officially Enrolled';
        }
        return 'Ongoing';
    };

    const handleSubmitDocuments = (student) => {
        setShowModal(true);
    };

    const handleFileSelect = (documentType, e) => {
        const file = e.target.files[0];
        if (file) {
            console.log(`Selected ${documentType}:`, file.name);
            setSelectedFiles(prev => ({
                ...prev,
                [documentType]: file
            }));
        }
    };


    // Add this button in your JSX where you display student information
    const renderStudentInfo = () => {
        if (!studentData) return null;

        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                {/* ... existing student info display ... */}

                {studentData.enrollmentStatus === 'For Document Review' && (
                    <button
                        onClick={() => setShowDocumentModal(true)}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center"
                    >
                        <FaFileUpload className="mr-2" />
                        Submit Documents
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4">
            <header className="bg-gray-800 text-white text-center py-4 text-xl font-bold">Student Enrollment & Tracking</header>
            <main className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6 mt-6">

                <div className="flex justify-center mb-6">
                    <button
                        onClick={() => setActiveTab('enrollment')}
                        className={`px-6 py-2 ${activeTab === 'enrollment' ? 'bg-blue-500 text-white' : 'bg-gray-300'} rounded-l-md`}
                    >
                        Enrollment Form
                    </button>
                    <button
                        onClick={() => setActiveTab('tracking')}
                        className={`px-6 py-2 ${activeTab === 'tracking' ? 'bg-blue-500 text-white' : 'bg-gray-300'} rounded-r-md`}
                    >
                        Tracking Search
                    </button>
                </div>

                {activeTab === 'enrollment' ? (
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">Student Enrollment Form</h1>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex justify-between">
                                <div className="w-full">
                                    <label htmlFor="fullName" className="block text-gray-600">Full Name</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div className="w-full ml-4">
                                    <label htmlFor="email" className="block text-gray-600">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <div className="w-full">
                                    <label htmlFor="phoneNumber" className="block text-gray-600">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div className="w-full ml-4">
                                    <label htmlFor="gradeLevel" className="block text-gray-600">Grade Level</label>
                                    <select
                                        id="gradeLevel"
                                        value={gradeLevel}
                                        onChange={(e) => setGradeLevel(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                        required
                                    >
                                        <option value="Grade 11">Grade 11</option>
                                        <option value="Grade 12">Grade 12</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <div className="w-full">
                                    <label htmlFor="guardianName" className="block text-gray-600">Guardian Name</label>
                                    <input
                                        type="text"
                                        id="guardianName"
                                        value={guardianName}
                                        onChange={(e) => setGuardianName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div className="w-full ml-4">
                                    <label htmlFor="guardianContact" className="block text-gray-600">Guardian Contact</label>
                                    <input
                                        type="tel"
                                        id="guardianContact"
                                        value={guardianContact}
                                        onChange={(e) => setGuardianContact(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <div className="w-full">
                                    <label htmlFor="strand" className="block text-gray-600">Strand</label>
                                    <select
                                        id="strand"
                                        value={strand}
                                        onChange={(e) => setStrand(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                        required
                                    >
                                        <option value="STEM">STEM</option>
                                        <option value="HUMS">HUMS</option>
                                        <option value="ABM">ABM</option>
                                        <option value="TVL-ICT Programming">TVL-ICT Programming</option>
                                        <option value="TVL-ICT CSS">TVL-ICT CSS</option>
                                        <option value="TVL-ICT Animation">TVL-ICT Animation</option>
                                        <option value="TVL-Industrial Arts">TVL-Industrial Arts</option>
                                        <option value="TVL-Travel Services">TVL-Travel Services</option>
                                        <option value="TVL-Home Economics">TVL-Home Economics</option>
                                        <option value="TVL-Fashion Design">TVL-Fashion Design</option>
                                        <option value="A&D Multimedia Arts">A&D Multimedia Arts</option>
                                        <option value="A&D Performing Arts">A&D Performing Arts</option>
                                    </select>
                                </div>
                                <div className="w-full ml-4 flex items-end">
                                    <button
                                        type="button"
                                        onClick={() => setTrackingNumber(generateTrackingNumber())}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Generate Tracking Number
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 text-gray-600">
                                <p><strong>Tracking Number:</strong> {trackingNumber}</p>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Submit
                            </button>
                        </form>

                        {status && <p className="mt-4 text-center text-green-600">{status}</p>}
                        {enrollmentStatus && <p className="mt-4 text-center text-blue-600">{enrollmentStatus}</p>} {/* Display enrollment status */}
                    </div>
                ) : (
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">Tracking Search</h1>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="bg-gray-800 text-white py-4 px-6">
                                    <h2 className="text-xl font-bold">Track Enrollment Status</h2>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="text"
                                            value={trackingSearch}
                                            onChange={(e) => setTrackingSearch(e.target.value)}
                                            placeholder="Enter Tracking Number"
                                            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <button
                                            onClick={handleSearch}
                                            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 ease-in-out"
                                        >
                                            Track Status
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {loading && (
                                <div className="mt-6 text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                                </div>
                            )}

                            {/* Student Information Table */}
                            {studentData && (
                                <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
                                    <div className="bg-gray-800 text-white py-4 px-6">
                                        <h2 className="text-xl font-bold">Student Information</h2>
                                    </div>

                                    <div className="p-6">
                                        <table className="min-w-full">
                                            <thead className="bg-gray-800 text-white">
                                            <tr>
                                                <th className="px-6 py-4 text-left">Full Name</th>
                                                <th className="px-6 py-4 text-left">Email</th>
                                                <th className="px-6 py-4 text-left">Phone</th>
                                                <th className="px-6 py-4 text-left">Grade Level</th>
                                                <th className="px-6 py-4 text-left">Tracking No.</th>
                                                <th className="px-6 py-4 text-left">Guardian</th>
                                                <th className="px-6 py-4 text-center">Status</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr className="border-b border-gray-200">
                                                <td className="px-6 py-4">{studentData.fullName}</td>
                                                <td className="px-6 py-4">{studentData.email}</td>
                                                <td className="px-6 py-4">{studentData.phoneNumber}</td>
                                                <td className="px-6 py-4">{studentData.gradeLevel}</td>
                                                <td className="px-6 py-4">{studentData.trackingNumber}</td>
                                                <td className="px-6 py-4">
                                                    {studentData.guardianName} ({studentData.guardianContact})
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col items-center justify-center">
                                                <span className={`font-bold ${
                                                    studentData.enrollmentStatus === 'For Interest Test'
                                                        ? 'text-purple-600'
                                                        : studentData.enrollmentStatus === 'Please take a interview with the strand coordinator in youre choosen strand'
                                                            ? 'text-orange-600'
                                                            : studentData.enrollmentStatus === 'For Document Review'
                                                                ? 'text-blue-600'
                                                                : 'text-gray-600'
                                                }`}>
                                                    {studentData.enrollmentStatus}
                                                </span>
                                                        <span className="text-sm text-gray-500 mt-1">
                                                            {studentData.strand}
                                                        </span>
                                                        <span className="text-sm text-gray-500 mt-1">
                                                            {studentData.section ? "Section " + studentData.section : ""}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
            {renderStudentInfo()}

            {showDocumentModal && studentData && (
                <DocumentSubmissionModal
                    studentData={studentData}
                    onClose={() => setShowDocumentModal(false)}
                />
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Submit Required Documents</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleFinalSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Form 137 *
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileSelect('form137', e)}
                                    className="w-full border rounded-md p-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Birth Certificate *
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileSelect('birthCertificate', e)}
                                    className="w-full border rounded-md p-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Good Moral Certificate *
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileSelect('goodMoral', e)}
                                    className="w-full border rounded-md p-2"
                                    required
                                />
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Submit Documents
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Document Submission Modal Component
const DocumentSubmissionModal = ({ studentData, onClose }) => {
    const [selectedFiles, setSelectedFiles] = useState({
        form137Url: null,
        birthCertificateUrl: null,
        goodMoralUrl: null
    });
    const [loading, setLoading] = useState(false);

    const handleFileSelect = (documentType, e) => {
        const file = e.target.files[0];
        if (file) {
            console.log(`Selected ${documentType}:`, file.name);
            setSelectedFiles(prev => ({
                ...prev,
                [documentType]: file
            }));
        }
    };

    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob); // Converts blob to Base64 URL-safe string
        });
    };

    const getStudentIdByTrackingNumber = async (strand, trackingNumber) => {
        const database = getDatabase();
        const studentRef = ref(database, `Interviewed/${strand}`);  // or your specific strand

        // Create a query to filter by the trackingNumber
        const q = query(studentRef, orderByChild('trackingNumber'), equalTo(trackingNumber));

        try {
            const snapshot = await get(q);

            if (snapshot.exists()) {
                // If the student data exists, we extract the unique ID
                const studentId = Object.keys(snapshot.val())[0];  // Firebase ID of the student record
                console.log('Student ID:', studentId);
                return studentId; // This is the ID you can use to access the student data
            } else {
                console.error('No student found with this tracking number');
                return null;
            }
        } catch (error) {
            console.error('Error getting student ID:', error);
        }
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log(selectedFiles);
        try {
            // Validate files
            if (!selectedFiles.form137Url || !selectedFiles.birthCertificateUrl || !selectedFiles.goodMoralUrl) {
                alert('Please upload all required documents');
                return;
            }

            const database = getDatabase();
            const studentId = await getStudentIdByTrackingNumber(studentData.strand, studentData.trackingNumber);
            const path = `Interviewed/${studentData.strand}/${studentId}`;

            const studentRef = ref(database, path);
            const snapshot = await get(studentRef);

            if (snapshot.exists()) {
                console.log('Student data found:', snapshot.val());

                const form137Base64 = await blobToBase64(selectedFiles.form137Url);
                const birthCertBase64 = await blobToBase64(selectedFiles.birthCertificateUrl);
                const goodMoralBase64 = await blobToBase64(selectedFiles.goodMoralUrl);

                console.log(form137Base64);
                console.log(birthCertBase64);
                console.log(goodMoralBase64);

                await set(studentRef, {
                    ...snapshot.val(),
                    form137Url: form137Base64,
                    birthCertificateUrl: birthCertBase64,
                    goodMoralUrl: goodMoralBase64,
                    documentsSubmitted: true,
                    submissionDate: new Date().toISOString(),
                    strand: studentData.strand,
                    status: 'For Document Review'
                });

                alert('Documents submitted successfully!');
                onClose();
            } else {
                throw new Error('Student data not found at path: ' + path);
            }

        } catch (error) {
            console.error('Error submitting documents:', error);
            alert('Error submitting documents: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Submit Required Documents</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleFinalSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Form 137 *
                        </label>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileSelect('form137Url', e)}
                            className="w-full border rounded-md p-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Birth Certificate *
                        </label>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileSelect('birthCertificateUrl', e)}
                            className="w-full border rounded-md p-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Good Moral Certificate *
                        </label>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileSelect('goodMoralUrl', e)}
                            className="w-full border rounded-md p-2"
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Submit Documents'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CombinedForm