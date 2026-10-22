"use client";
import { useEffect, useState, useMemo } from "react";
import styles from "./page.module.css";
import Cookies from "js-cookie";
import { showErrorToast, showSuccessToast } from "@/app/components/ToastProvider";

export default function ChangeEmail({ isOpen, onClose, setShowOtp, newEmail }) {
  if (!isOpen) return null;

  const [emaildata, setEmaildata] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isValidEmail = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emaildata);
  }, [emaildata]);

  const handleChange = (e) => {
    setEmaildata(e.target.value);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (isSending || !isValidEmail) return;

    if (!emaildata.trim()) {
      showErrorToast("Please enter your email address");
      return;
    }

    setIsSending(true);

    try {
      
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        console.log("No access token found");
        setIsSending(false);
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/investor/resend-edit-email-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ new_email: emaildata }),
        }
      );
      const data = await res.json();
    
      if (data?.success === true) {
        // Check for nested error even if success is true
        if (data?.data?.statusCode === 400 || data?.data?.type === 'error') {
          showErrorToast(data?.data?.message || "Failed to send OTP");
          setIsSending(false);
          return;
        }

        showSuccessToast(data?.message || "OTP sent successfully");
        onClose();
        newEmail(emaildata);
        setShowOtp(true); 
      } else {
        showErrorToast(data?.message||"Failed to send OTP");
        setIsSending(false);
      }
    } catch (err) {
      console.error("Error:", err);
      showErrorToast("Error sending OTP");
      setIsSending(false);
    }
  };

  
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.headar}>
          <button className={styles.closeBtn} onClick={onClose}>
            <img src="/otp modal/cross-close.svg" alt="cross-close" />
          </button>
          <h3 className={styles.title}>Change Email</h3>
        </div>
        <div className={styles.hr}></div>

        <div className={styles.main_div}>
          <p className={styles.subtitle}>
            Enter the new email you would like to use
          </p>

          <div className={styles.inputGroup}>
            <label className={styles.lable}>Email</label>
            <input
              className={styles.input}
              type="email"
              placeholder="lm@example.com"
              onChange={handleChange}
              value={emaildata}
            />
          </div>

          <button 
            className={`${styles.sendBtn} ${(!isValidEmail || isSending) ? styles.buttonDisabled : ""}`}
            onClick={handleSendOtp} 
            disabled={!isValidEmail || isSending}
          >
            {isSending ? (
              <div className={styles.loaderWrapper}>
                <span className={styles.loader}></span>
                <span>Sending...</span>
              </div>
            ) : (
              "Send OTP"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
