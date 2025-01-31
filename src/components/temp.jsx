import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const FaceRecognition = () => {
  const videoRef = useRef();
  const [recognitionPercentage, setRecognitionPercentage] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const detectionRunning = useRef(true);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        console.log("Face detection model loaded successfully");
      } catch (error) {
        console.error("Error loading face detection model:", error);
      }
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: {} })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          console.log("Video stream started:", stream);
        })
        .catch((err) => console.error("Error accessing camera:", err));
    };

    const detectFace = async () => {
      if (!detectionRunning.current) return;

      const detections = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      );

      if (detections) {
        const confidence = (detections.score * 100).toFixed(2);
        setRecognitionPercentage(confidence);

        if (confidence > 95) {
          captureSnapshot();
          detectionRunning.current = false; // Stop detection after match
        }
      }

      requestAnimationFrame(detectFace);
    };

    const captureSnapshot = () => {
      const canvas = document.createElement("canvas");
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      setSnapshot(canvas.toDataURL("image/png")); // Save snapshot
    };

    loadModels().then(() => {
      startVideo();
      videoRef.current.onplay = () => {
        detectionRunning.current = true;
        detectFace();
      };
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Face Detection App</h1>
      <div className="flex items-center">
        {snapshot && (
          <img
            src={snapshot}
            alt="Snapshot"
            className="w-48 h-48 rounded-lg shadow-lg mr-6"
          />
        )}
        <video ref={videoRef} autoPlay muted className="rounded-lg shadow-lg"></video>
      </div>
      {recognitionPercentage && (
        <p className="mt-4 text-xl font-semibold">
          Detection Confidence: <span className="text-blue-600">{recognitionPercentage}%</span>
        </p>
      )}
    </div>
  );
};

export default FaceRecognition;



