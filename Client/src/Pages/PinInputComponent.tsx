import React, { useEffect, useState } from "react";
import OtpInput from "react-otp-input";
import styles from "../styles/PinInput.module.css";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ToastComponent, { showSuccessToast, showErrorToast } from '../UI/ToastComponent';
import { BsFillShieldLockFill } from "react-icons/bs";
const apiKey = process.env.REACT_APP_API_KEY;

const App: React.FC = () => {
  const [code, setCode] = useState<string>("");
  const navigate = useNavigate();
  const userType = sessionStorage.getItem("user_type")
  const isAdmin = sessionStorage.getItem("isAdmin")

  const handleChange = (code: string) => setCode(code);
  const phone_no = sessionStorage.getItem("phone_no")

  const ac_code = sessionStorage.getItem("ac_code")

  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post(`${apiKey}/verify-otp`, {
        phone_no: phone_no,
        otp: code
      });
      if (isAdmin === "Y") {
        navigate('/dashboard');
      }
      else {
        navigate('/publishedlist');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      showErrorToast("Failed to verify OTP")
    }
  };

  return (
    <>
      <ToastComponent />
      <div className={styles.AppDiv}>
        <div className="bg-white text-emerald-500 w-fit mx-auto p-4 rounded-full">
        <BsFillShieldLockFill size={60} />
      </div>
       <label htmlFor="otp" className="font-bold text-xl text-black text-center">
        Enter your OTP
      </label>
        <OtpInput
          value={code}
          onChange={handleChange}
          numInputs={6}
          renderSeparator={<span style={{ width: "4px" }}></span>}
          shouldAutoFocus
          inputStyle={styles.otpInput}
          renderInput={(props) => <input {...props} />}
        />
        
      </div>
      <button className={styles.verifyOtpButton} type="button" onClick={handleVerifyOTP}>Verify OTP</button>
    </>
  );
};

export default App;
