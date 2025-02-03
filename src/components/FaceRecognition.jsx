import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import CheckLiveness from "./CheckLiviness";

const FaceRecognition = () => {
  const webcamRef = useRef(null);
  const [recognitionPercentage, setRecognitionPercentage] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [model, setModel] = useState("TinyFaceDetector");
  const detectionRunning = useRef(true);
  const [face, setFace] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        // await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        // await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        // await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
        console.log("Models loaded successfully");
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };

    const detectFaces = async () => {
      if (!detectionRunning.current || !webcamRef.current) return;

      const video = webcamRef.current.video;
      const options = new faceapi.TinyFaceDetectorOptions();

      const detections = await faceapi.detectAllFaces(video, options);

      if (detections.length > 1) {
        setMultipleFaces(true);
        setRecognitionPercentage(null);
      } else if (detections.length === 1) {
        setMultipleFaces(false);
        const confidence = (detections[0].score * 100).toFixed(2);
        setRecognitionPercentage(confidence);

        if (confidence > 98) {
          console.log("the confidence", confidence);
          setFace(true);
          captureSnapshot();
          detectionRunning.current = false;
        }
      } else {
        setMultipleFaces(false);
        setRecognitionPercentage(null);
      }

      requestAnimationFrame(detectFaces);
    };

    const captureSnapshot = () => {
      const imageSrc = webcamRef.current.getScreenshot();
      setSnapshot(imageSrc);
    };

    loadModels().then(() => {
      detectionRunning.current = true;
      detectFaces();
    });

    return () => {
      detectionRunning.current = false;
    };
  }, [model]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Face Recognition</h1>
        {snapshot && (
          <img
            src={snapshot}
            alt="Snapshot"
            className="w-32 h-32 rounded-lg shadow-md mx-auto mb-4"
          />
        )}
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "user" }}
          className="rounded-lg shadow-lg w-full"
        />
        {multipleFaces ? (
          <p className="mt-4 text-red-500 font-semibold">
            Multiple Faces Found
          </p>
        ) : recognitionPercentage ? (
          <p className="mt-4 text-blue-500 font-semibold">
            Detection Confidence: {recognitionPercentage}%
          </p>
        ) : (
          <p className="mt-4 text-gray-500">No Face Detected</p>
        )}
      </div>

      {snapshot && <CheckLiveness image={snapshot} />}
    </div>
  );
};

export default FaceRecognition;
