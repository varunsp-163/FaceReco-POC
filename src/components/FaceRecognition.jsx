import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import CheckLiveness from "./CheckLiviness";

const FaceRecognition = () => {
  const webcamRef = useRef(null);
  const [recognitionPercentage, setRecognitionPercentage] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [model, setModel] = useState("TinyFaceDetector"); // Default model
  const detectionRunning = useRef(true);
  const [face, setFace] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
        console.log("Models loaded successfully");
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };

    const detectFaces = async () => {
      if (!detectionRunning.current || !webcamRef.current) return;

      const video = webcamRef.current.video;
      const options =
        model === "TinyFaceDetector"
          ? new faceapi.TinyFaceDetectorOptions()
          : new faceapi.SsdMobilenetv1Options();

      const detections = await faceapi.detectAllFaces(video, options);

      if (detections.length > 1) {
        setMultipleFaces(true);
        setRecognitionPercentage(null);
      } else if (detections.length === 1) {
        setMultipleFaces(false);
        const confidence = (detections[0].score * 100).toFixed(2);
        setRecognitionPercentage(confidence);

        if (confidence > 95) {
          setFace(true);
          captureSnapshot();
          detectionRunning.current = false; // Stop detection after match
        } else {
          // setFace(false);
        }
      } else {
        setMultipleFaces(false);
        setRecognitionPercentage(null);
      }

      requestAnimationFrame(detectFaces);
    };

    const captureSnapshot = () => {
      const imageSrc = webcamRef.current.getScreenshot();
      setSnapshot(imageSrc); // Save snapshot
    };

    loadModels().then(() => {
      detectionRunning.current = true;
      detectFaces();
    });

    return () => {
      detectionRunning.current = false; // Stop detection when component unmounts
    };
  }, [model]);

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-gray-100 ${
        face ? "bg-green-500" : "bg-white"
      }`}
    >
      <h1 className="text-3xl font-bold mb-6">Face Detection App</h1>
      <div className="items-center flex flex-col">
        {snapshot && (
          <img
            src={snapshot}
            alt="Snapshot"
            className="w-48 h-48 rounded-lg shadow-lg mr-6"
          />
        )}
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: "user",
          }}
          className="rounded-lg shadow-lg"
        />
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

      <h1 className="mt-4">Checking Liveness</h1>
      {snapshot && <CheckLiveness image={snapshot} />}
    </div>
  );
};

export default FaceRecognition;
