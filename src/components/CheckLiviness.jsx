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

  console.log("The profile image", profileImg);
  console.log("The image to verify", image);

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
          setSimilarityScore(response.data.score);
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

    if (profileImg && image) {
      verifyFace();
      checkLiveness();
    }
  }, [profileImg, image]); // Trigger when profileImg or image changes

  return (
    <>
      <div className="bg-gray-500">
        <h1>You have to upload 1</h1>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {profileImg && <img src={profileImg} alt="Profile" className="my-4" />}
      </div>

      <div>
        {livenessScore !== null && (
          <p className="text-xl font-semibold">
            Liveness Score: {livenessScore}
          </p>
        )}
        {errorMessage && <p className="text-red-600">{errorMessage}</p>}
      </div>

      <div>
        {similarityScore !== null && (
          <p className="text-xl font-semibold">
            Similarity Score: {similarityScore}
          </p>
        )}
        {errorMessage && <p className="text-red-600">{errorMessage}</p>}
      </div>

      {profileImg && (
        <div>
          <h1>Profile Image</h1>
          <img src={profileImg} alt="Profile" />
        </div>
      )}
    </>
  );
};

export default CheckLiveness;
