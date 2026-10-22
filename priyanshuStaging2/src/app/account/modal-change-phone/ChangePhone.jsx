"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import styles from "./ChangePhone.module.css";
import Cookies from "js-cookie";
import { showErrorToast, showSuccessToast } from "@/app/components/ToastProvider";

const COUNTRY_DIAL_CODES = [
  { name: "India", code: "+91" },
  { name: "United States", code: "+1" },
  { name: "United Kingdom", code: "+44" },
  { name: "Canada", code: "+1" },
  { name: "Australia", code: "+61" },
  { name: "Germany", code: "+49" },
  { name: "France", code: "+33" },
  { name: "Italy", code: "+39" },
  { name: "Spain", code: "+34" },
  { name: "Brazil", code: "+55" },
  { name: "Mexico", code: "+52" },
  { name: "Japan", code: "+81" },
  { name: "China", code: "+86" },
  { name: "South Korea", code: "+82" },
  { name: "Singapore", code: "+65" },
  { name: "UAE", code: "+971" },
  { name: "Saudi Arabia", code: "+966" },
  { name: "Qatar", code: "+974" },
  { name: "Kuwait", code: "+965" },
  { name: "Oman", code: "+968" },
  { name: "Bahrain", code: "+973" },
  { name: "Malaysia", code: "+60" },
  { name: "Thailand", code: "+66" },
  { name: "Indonesia", code: "+62" },
  { name: "Vietnam", code: "+84" },
  { name: "Philippines", code: "+63" },
  { name: "Sri Lanka", code: "+94" },
  { name: "Nepal", code: "+977" },
  { name: "Bangladesh", code: "+880" },
  { name: "Pakistan", code: "+92" },
  { name: "South Africa", code: "+27" },
  { name: "Nigeria", code: "+234" },
  { name: "Kenya", code: "+254" },
  { name: "Egypt", code: "+20" },
  { name: "Turkey", code: "+90" },
  { name: "Russia", code: "+7" },
  { name: "Ukraine", code: "+380" },
  { name: "Poland", code: "+48" },
  { name: "Netherlands", code: "+31" },
  { name: "Belgium", code: "+32" },
  { name: "Sweden", code: "+46" },
  { name: "Norway", code: "+47" },
  { name: "Denmark", code: "+45" },
  { name: "Finland", code: "+358" },
  { name: "Switzerland", code: "+41" },
  { name: "Austria", code: "+43" },
  { name: "Ireland", code: "+353" },
  { name: "New Zealand", code: "+64" },
];

export default function ChangePhone({ isOpen, onClose, userId }) {
  const [step, setStep] = useState("phone"); // 'phone' | 'otp'
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const countrySelectRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // OTP States
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(29);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("phone");
      setPhone("");
      setOtp(new Array(6).fill(""));
      setTimer(29);
    }
  }, [isOpen]);

  // Timer logic
  useEffect(() => {
    let countdown;
    if (step === "otp" && timer > 0) {
      countdown = setTimeout(() => setTimer(timer - 1), 1000);
    }
    return () => clearTimeout(countdown);
  }, [timer, step]);

  const isValidPhone = useMemo(
    () => /^\d{8,16}$/.test(phone),
    [phone]
  );

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        countrySelectRef.current &&
        !countrySelectRef.current.contains(event.target)
      ) {
        setIsCountryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!isValidPhone || loading) return;

    setLoading(true);

    try {
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        console.log("No access token found");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_USER_BASE}/investor/api/investor/edit-phone-number`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ phone_number: `${countryCode}${phone}` }),
        }
      );
      const data = await res.json();
      if (data.success) {
        showSuccessToast("OTP sent successfully");
        setStep("otp");
        setTimer(29);
      } else {
        showErrorToast(data.message || "Failed to send OTP");
      }

    } catch (err) {
      console.log("Error sending OTP:", err);
      showErrorToast("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResending) return;
    setIsResending(true);
    try {
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_USER_BASE}/investor/api/investor/edit-phone-number`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ phone_number: `${countryCode}${phone}` }),
        }
      );
      const data = await res.json();
      if (data.success) {
        showSuccessToast("OTP resent successfully");
        setTimer(29);
      } else {
        showErrorToast(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      console.log("Error resending OTP:", err);
      showErrorToast("Something went wrong");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) return;

    setIsVerifying(true);
    try {
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) return;

      const payload = {
        user_id: userId,
        phone_number: `${countryCode}${phone}`,
        otp: enteredOtp,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_USER_BASE}/investor/api/investor/verify-update-phone-number-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      
      if (res.status === 400 || !data.success) {
        showErrorToast(data.message || "Invalid OTP");
        setIsVerifying(false);
        return;
      }

      showSuccessToast("Phone number updated successfully");
      onClose();
      window.location.reload();

    } catch (err) {
      console.log("Error verifying OTP:", err);
      showErrorToast("Something went wrong");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.headar}>
          <button className={styles.closeBtn} onClick={onClose}><img src="/otp modal/cross-close.svg" alt="cross-close" /></button>
          <h3 className={styles.title}>
            {step === "phone" ? "Change Mobile Number" : "OTP Verification"}
          </h3>
        </div>
        <div className={styles.hr}></div>
        <div className={styles.main_div}>
          
          {step === "phone" ? (
            <>
              <p className={styles.subtitle}>Enter the new Mobile you would like to use</p>

              <label className={styles.lable}>Mobile Number</label>
              <div className={styles.phoneInputWrapper}>
                <div className={styles.countrySelect} ref={countrySelectRef}>
                  <button
                    type="button"
                    className={styles.countryTrigger}
                    onClick={() => setIsCountryOpen((prev) => !prev)}
                  >
                    {countryCode}
                    <span
                      className={`${styles.countryChevron} ${isCountryOpen ? styles.countryChevronOpen : ""
                        }`}
                    >
                      ▾
                    </span>
                  </button>
                  {isCountryOpen && (
                    <div className={styles.countryMenu}>
                      {COUNTRY_DIAL_CODES.map((country) => (
                        <button
                          key={`${country.name}-${country.code}`}
                          type="button"
                          className={`${styles.countryOption} ${country.code === countryCode
                              ? styles.countryOptionActive
                              : ""
                            }`}
                          onClick={() => {
                            setCountryCode(country.code);
                            setIsCountryOpen(false);
                          }}
                        >
                          {country.code}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  className={styles.phoneInput}
                  placeholder="Enter Phone Number"
                  value={phone}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 16);
                    setPhone(digitsOnly);
                  }}
                  inputMode="numeric"
                  maxLength={16}
                />
              </div>

              <button
                className={`${styles.sendBtn} ${(!isValidPhone || loading) ? styles.buttonDisabled : ""}`}
                onClick={handleSendOtp}
                disabled={!isValidPhone || loading}
              >
                {loading ? (
                  <div className={styles.loaderWrapper}>
                    <span className={styles.loader}></span>
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send OTP"
                )}
              </button>
            </>
          ) : (
            <>
              <p className={styles.subtitle}>Enter the code sent to {countryCode} {phone}</p>
              
              <div className={styles.otpInputs}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
                      if (pasted.length === 6) {
                        setOtp(pasted.split(""));
                        document.getElementById(`otp-5`)?.focus();
                      }
                    }}
                  />
                ))}
              </div>

              <div className={styles.timer}>
                <span className={styles.red}>
                  00:{timer < 10 ? `0${timer}` : timer}
                </span>
                <button
                  className={styles.resendBtn}
                  onClick={handleResendOtp}
                  disabled={timer > 0 || isResending}
                >
                  {isResending ? "Resending..." : "Resend Code"}
                </button>
              </div>

              <button
                className={`${styles.sendBtn} ${otp.some(d => d === "") || isVerifying ? styles.buttonDisabled : ""}`}
                onClick={handleVerifyOtp}
                disabled={otp.some(d => d === "") || isVerifying}
              >
                 {isVerifying ? (
                  <div className={styles.loaderWrapper}>
                    <span className={styles.loader}></span>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Verify & Update"
                )}
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
