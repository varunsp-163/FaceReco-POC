import React, { useState, useEffect } from "react";
import axios from "axios";

const CheckLiveness = ({ image }) => {
  const [livenessScore, setLivenessScore] = useState(null);
  const [similarityScore, setSimilarityScore] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [done, setDone] = useState(false);
  const [profileImg, setProfileImg] = useState(null); // State for profile image

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImg(reader.result); // Set the profile image to base64
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const verifyFace = async () => {
      try {
        const response = await axios.post(
          "https://bullforce-trader-registration-service-staging.bullforce.co/api/verfy/Face",
          {
            img1: profileImg, // Send the base64 profile image
            img2: image, // Pass the base64 image to verify
            emailid: "spvarun47@gmail.com", // Provided email
            mobileno: "9880193070", // Provided mobile number
            aadhar: "9197", // Provided Aadhar number
            pub_ip: "106.51.77.251", // Provided public IP address
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Verify FACE:", response.data);

        if (response.data.status === 200) {
          setSimilarityScore(response.data.similarity);
        } else {
          setErrorMessage(response.data.message || "Something went wrong");
        }
      } catch (error) {
        setErrorMessage("Error contacting server.");
        console.error(error);
      }
    };

    const checkLiveness = async () => {
      try {
        const response = await axios.post(
          "https://bullforce-trader-registration-service-staging.bullforce.co/api/verfy/check_liveness",
          {
            img2: image, // Pass base64 image for liveness check
            emailid: "spvarun47@gmail.com", // Provided email
            mobileno: "9880193070", // Provided mobile number
            aadhar: "9197", // Provided Aadhar number
            pub_ip: "106.51.77.251", // Provided public IP address
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("checkLiveness:", response.data);

        if (response.data.status === 200) {
          setLivenessScore(response.data.score);
        } else {
          setErrorMessage(response.data.message || "Something went wrong");
        }
      } catch (error) {
        setErrorMessage("Error contacting server.");
        console.error(error);
      }
    };

    if (image) {
      // verifyFace();
      checkLiveness();
    }
  }, [profileImg, image]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center space-y-6">
      <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-md text-center">
        {livenessScore !== null && (
          <p className="text-xl font-semibold text-blue-600">
            Liveness Score: {livenessScore}
          </p>
        )}
        {similarityScore !== null && (
          <p className="text-xl font-semibold text-green-600">
            Similarity Score: {similarityScore}
          </p>
        )}
        {errorMessage && <p className="text-red-600 mt-2">{errorMessage}</p>}
      </div>

      {profileImg && (
        <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-md text-center">
          <h2 className="text-lg font-semibold text-gray-700">Profile Image</h2>
          <img
            className="w-64 h-64 object-cover rounded-lg mx-auto mt-2 border border-gray-300"
            src={profileImg}
            alt="Profile"
          />
        </div>
      )}

      <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-md text-center">
        <h2 className="text-lg font-semibold text-gray-700">Images Sent</h2>
        {profileImg && (
          <img
            className="w-64 h-64 object-cover rounded-lg mx-auto mt-2 border border-gray-300"
            src={profileImg}
            alt="Sent Profile"
          />
        )}
      </div>
    </div>
  );
};

export default CheckLiveness;
