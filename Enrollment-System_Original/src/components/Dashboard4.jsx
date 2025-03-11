import { initializeApp } from 'firebase/app';
import React, { useState, useEffect } from 'react';
import {FaCheckCircle, FaEye, FaFileAlt, FaTimes, FaTimesCircle} from 'react-icons/fa';
import {getDatabase, ref, onValue, update, set, remove, get} from 'firebase/database';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';

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

const Dashboard4 = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [documentUrls, setDocumentUrls] = useState({
    form137Url: false,
    birthCertificateUrl: false,
    goodMoralUrl: false
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

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
        const dashboard4Ref = ref(database, `FinalReview/${strand}`);
        onValue(dashboard4Ref, snapshot => {
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

  const getSectionForStudent = async (strand) => {
    try {
      const strandPath = `Enrolled/${strand}`;
      const strandRef = ref(database, strandPath);

      // Fetch all students in the strand
      const snapshot = await get(strandRef);

      if (!snapshot.exists()) {
        console.log("No students found in this strand. Returning Section 1.");
        return 1; // First section if no students exist
      } else {
        const strandData = snapshot.val();

        // Group students by section
        const sections = {};
        Object.values(strandData).forEach((s) => {
          if (!sections[s.section]) {
            sections[s.section] = [];
          }
          sections[s.section].push(s);
        });

        // Find the appropriate section
        for (const [section, students] of Object.entries(sections)) {
          if (students.length < 10) {
            return parseInt(section); // Return the section with space
          }
        }

        // All sections are full, create a new section
        const newSection = Math.max(...Object.keys(sections).map(Number)) + 1;
        return newSection; // Return the new section number
      }
    } catch (error) {
      console.error("Error determining section:", error);
      throw new Error("Unable to determine section");
    }
  };


  const handleApproveStudent = async (student) => {
    try {
      setLoading(true);
      await getSectionForStudent(student.strand)
          .then((section) => {
            console.log(`Assigned Section: ${section}`);
            // Move to Enrolled collection
            const enrolledRef = ref(database, `Enrolled/${student.strand}/${student.trackingNumber}`);
            set(enrolledRef, {
              ...student,
              status: 'Enrolled',
              section: section,
              enrollmentDate: new Date().toISOString()
            }).then(() =>{
                  // Remove from Dashboard4
                  const dashboard4Ref = ref(database, `FinalReview/${student.strand}/${student.trackingNumber}`);
                  remove(dashboard4Ref);
                  setModalContent({
                    title: 'Success',
                    message: 'Student has been enrolled successfully!',
                  });
                  setModalOpen(true);
                  setLoading(false);
                });


          })
          .catch((error) => {
            console.error(error);
            setLoading(false);
          });

    } catch (error) {
      console.error('Error enrolling student:', error);
      setLoading(false);
      setModalContent({
        title: 'Error',
        message: 'Error enrolling student. Please try again.',
      });
      setModalOpen(true);
    }
  };

  const handleRejectStudent = async (student) => {
    if (window.confirm('Are you sure you want to reject this student?')) {
      try {
        // Move to Rejected collection
        const rejectedRef = ref(database, `Rejected/${student.strand}/${student.trackingNumber}`);
        await set(rejectedRef, {
          ...student,
          status: 'Rejected',
          rejectionDate: new Date().toISOString()
        });

        // Remove from Dashboard4
        const dashboard4Ref = ref(database, `FinalReview/${student.strand}/${student.trackingNumber}`);
        await remove(dashboard4Ref);

        alert('Student has been rejected.');
      } catch (error) {
        console.error('Error rejecting student:', error);
        alert('Error rejecting student. Please try again.');
      }
    }
  };

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
                    className="px-4 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-800"
                    disabled={isSubmitting}
                >
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
        Document Review Panel
      </header>
      
      <main className="max-w-7xl mx-auto mt-6">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4">Loading...</p>
          </div>
        ) : (
          Object.entries(data).map(([strand, students]) => (
            students && Object.keys(students).length > 0 && (
              <div key={strand} className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-800 text-white px-6 py-4">
                  <h2 className="text-xl font-semibold">{strand}</h2>
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
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(students).map(([id, student]) => (
                        <tr key={id}>
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
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApproveStudent(student)}
                                className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors"
                              >
                                <FaCheckCircle className="inline mr-1" />
                                Enroll
                              </button>
                              <button
                                onClick={() => handleRejectStudent(student)}
                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
                              >
                                <FaTimesCircle className="inline mr-1" />
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ))
        )}
      </main>
      {/* Document Modal */}
      {showDocumentModal && (
          <DocumentModal
              student={selectedStudent}
              onClose={handleCloseDocumentModal}
          />
      )}
      <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={modalContent.title}
          message={modalContent.message}
      />
    </div>
  );
};

export default Dashboard4;