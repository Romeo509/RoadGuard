import React, { useState, useEffect, useRef } from "react";

const Home = () => {
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [error, setError] = useState(null);
  const [description, setDescription] = useState("");
  const videoRef = useRef(null);
  const [image, setImage] = useState(null);
  const [isImageCaptured, setIsImageCaptured] = useState(false); // Track if image is captured
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Track if success modal is shown

  // Get User Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (err) => setError("Location access denied!")
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

  // Access Camera
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => setError("Camera access denied!"));
  }, []);

  // Capture Image from Video Stream
  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      setImage(blob);
      setIsImageCaptured(true); // Set image captured state to true
    }, 'image/jpeg', 0.95);
  };

  // Cancel Image Capture
  const cancelImageCapture = () => {
    setImage(null);
    setIsImageCaptured(false); // Reset image captured state
  };

  // Handle Form Submission
  const handleSubmit = async () => {
    if (!location.lat || !location.lon || !description || !image) {
      setError("Please fill all fields and capture an image.");
      return;
    }

    const formData = new FormData();
    formData.append('lat', location.lat);
    formData.append('lon', location.lon);
    formData.append('description', description);
    formData.append('image', image, 'capture.jpg');

    try {
      const response = await fetch('http://localhost:3000/submit', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      console.log('Server Response:', result);

      if (response.ok) {
        setShowSuccessModal(true); // Show success modal
        setError(null); // Clear any previous error
      } else {
        setError(result.error || 'Failed to submit data');
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      setError('Failed to submit data');
    }
  };

  // Close Success Modal and Reset Page
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    resetPage(); // Reset the entire page
  };
  
  // Reset Page
  const resetPage = () => {
    setLocation({ lat: null, lon: null });
    setDescription("");
    setImage(null);
    setIsImageCaptured(false);
    setError(null);
  };

  return (
    <div style={styles.container}>
      <h1>Safeguard Home</h1>

      {/* Display Location */}
      {error ? <p style={styles.error}>{error}</p> : (
        <p>📍 Location: {location.lat}, {location.lon}</p>
      )}

      {/* Camera Feed */}
      <div style={styles.cameraContainer}>
        <video ref={videoRef} autoPlay style={styles.video}></video>
      </div>

      {/* Capture Image Button */}
      {!isImageCaptured ? (
        <button onClick={captureImage} style={styles.button}>
          Capture Image
        </button>
      ) : (
        <div style={styles.captureActions}>
          <button style={styles.successButton}>✅ Image Captured</button>
          <button onClick={cancelImageCapture} style={styles.cancelButton}>
            Cancel
          </button>
        </div>
      )}

      {/* Description Form */}
      <textarea 
        placeholder="Describe the situation..." 
        style={styles.textarea}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>

      {/* Submit Button */}
      <button onClick={handleSubmit} style={styles.button}>Submit</button>

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Thank You! 🎉</h2>
            <p style={styles.modalMessage}>Your submission was successful.</p>
            <button onClick={closeSuccessModal} style={styles.modalButton}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    fontFamily: "Arial, sans-serif"
  },
  cameraContainer: {
    width: "100%",
    maxWidth: "400px",
    margin: "10px auto",
    border: "2px solid #333",
    borderRadius: "10px",
    overflow: "hidden"
  },
  video: {
    width: "100%",
    height: "auto"
  },
  textarea: {
    width: "90%",
    height: "100px",
    marginTop: "10px",
    padding: "10px",
    fontSize: "16px"
  },
  button: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px 20px",
    fontSize: "18px",
    marginTop: "10px",
    cursor: "pointer",
    border: "none",
    borderRadius: "5px"
  },
  captureActions: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "10px"
  },
  successButton: {
    backgroundColor: "#28a745",
    color: "white",
    padding: "10px 20px",
    fontSize: "18px",
    cursor: "pointer",
    border: "none",
    borderRadius: "5px"
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    color: "white",
    padding: "10px 20px",
    fontSize: "18px",
    cursor: "pointer",
    border: "none",
    borderRadius: "5px"
  },
  error: {
    color: "red",
    fontWeight: "bold"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  modal: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "15px",
    textAlign: "center",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    maxWidth: "400px",
    width: "90%"
  },
  modalTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#28a745",
    marginBottom: "10px"
  },
  modalMessage: {
    fontSize: "18px",
    color: "#333",
    marginBottom: "20px"
  },
  modalButton: {
    backgroundColor: "#28a745",
    color: "white",
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    border: "none",
    borderRadius: "5px",
    marginTop: "10px",
    transition: "background-color 0.3s ease"
  }
};

export default Home;
