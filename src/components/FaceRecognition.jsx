import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const FaceRecognition = () => {
  const videoRef = useRef();
  const [recognitionPercentage, setRecognitionPercentage] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [model, setModel] = useState("TinyFaceDetector"); // Default model
  const detectionRunning = useRef(true);
  const [face, setFace] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        // Load the required models
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models"); // Optional but recommended
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models"); // Optional but recommended
        console.log("Models loaded successfully");
      } catch (error) {
        console.error("Error loading models:", error);
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

    const detectFaces = async () => {
      if (!detectionRunning.current) return;

      const options =
        model === "TinyFaceDetector"
          ? new faceapi.TinyFaceDetectorOptions()
          : new faceapi.SsdMobilenetv1Options();

      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        options
      );

      if (detections.length > 1) {
        setMultipleFaces(true);
        setRecognitionPercentage(null);
      } else if (detections.length === 1) {
        setMultipleFaces(false);
        const confidence = (detections[0].score * 100).toFixed(2);
        setRecognitionPercentage(confidence);

        if (confidence > 95) {
          setFace(true);
          // captureSnapshot();
          // detectionRunning.current = false; // Stop detection after match
        } else {
          setFace(false);
        }
      } else {
        setMultipleFaces(false);
        setRecognitionPercentage(null);
      }

      requestAnimationFrame(detectFaces);
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
        detectFaces();
      };
    });
  }, [model]);

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen 
      bg-gray-100 ${face ? "bg-green-500" : "bg-white"}`}
    >
      <h1 className="text-3xl font-bold mb-6">Face Detection App</h1>
      <div className="flex items-center">
        {snapshot && (
          <img
            src={snapshot}
            alt="Snapshot"
            className="w-48 h-48 rounded-lg shadow-lg mr-6"
          />
        )}
        <video
          ref={videoRef}
          autoPlay
          muted
          className="rounded-lg shadow-lg"
        ></video>
      </div>
      {multipleFaces ? (
        <p className="mt-4 text-xl font-semibold text-red-600">
          Multiple Faces Found
        </p>
      ) : recognitionPercentage ? (
        <p className="mt-4 text-xl font-semibold">
          Detection Confidence:{" "}
          <span className="text-blue-600">{recognitionPercentage}%</span>
        </p>
      ) : (
        <p className="mt-4 text-xl font-semibold text-gray-600">
          No Face Detected
        </p>
      )}
      <div className="mt-4">
        <label htmlFor="model-select" className="mr-2">
          Select Model:
        </label>
        <select
          id="model-select"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="TinyFaceDetector">TinyFaceDetector</option>
          <option value="SsdMobilenetv1">SsdMobilenetv1</option>
        </select>
      </div>
    </div>
  );
};

export default FaceRecognition;
