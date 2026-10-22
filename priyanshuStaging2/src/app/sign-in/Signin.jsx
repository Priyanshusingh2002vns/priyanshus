"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import styles from "./Signin.module.css";
import { showErrorToast } from "../components/ToastProvider";
import Cookies from "js-cookie";
import { useMultiStepContext } from "../utils/MultiStepContext";

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

const Signin = ({ onShowOtp, onShowSignUp, onEmailSubmit }) => {
  const [mode, setMode] = useState("phone"); // phone | email
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const countrySelectRef = useRef(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { updateFormData } = useMultiStepContext();

  const isValidPhone = useMemo(
    () => /^\d{8,16}$/.test(phone),
    [phone]
  );

  const isValidEmail = useMemo(() => {
    const regex = /[^@\s]+@[^@\s]+\.[^@\s]+/;
    return regex.test(email.trim());
  }, [email]);

  const isFormValid = useMemo(() => {
    return mode === "phone" ? isValidPhone : isValidEmail;
  }, [mode, isValidPhone, isValidEmail]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    if (!executeRecaptcha) {
      showErrorToast("reCAPTCHA is not ready yet. Please try again in a moment.");
      return;
    }

    if (mode === "phone" && !isValidPhone) return;
    if (mode === "email" && !isValidEmail) return;

    setLoading(true);
    try {
      // Get a reCAPTCHA v3 token for the \"login\" action
      const token = await executeRecaptcha("login");
      console.log("token4", token);

    const payload = {
      recaptchaToken: token,
      ...(mode === "phone"
        ? { phone_number: `${countryCode}${phone}` }
        : { email }),
    };

      // Send email and reCAPTCHA v3 token to your backend API
      // Your backend will verify the token using the secret key
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/investor/login-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data?.message === "User not found. Please register first.") {
         

          if (mode === "phone") {
            updateFormData("phonenumber", phone); // ✅ MATCH CONTEXT KEY
          }

          // Optional: prefill signup form
          if (mode === "email") {
            updateFormData("email", email);
          }

          onShowSignUp(); // 👈 go to signup flow
          return;
        }

        showErrorToast(data.message || "Something went wrong.");
        return;
      }


      Cookies.set("verifyOtp", "true");

      onShowOtp({
        type: mode === "phone" ? "mobile" : "email",
        identifier: mode === "phone" ? `${countryCode}${phone}` : email,
        verifyEndpoint: mode === "phone"
          ? "verify-phone-number-otp"
          : "verify-email-otp",
        resendEndpoint:
          mode === "phone"
            ? "resend-phone-number-otp"
            : "resend-email-otp",
      });

    } catch (error) {
      showErrorToast("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <section className={styles.pageWrapper}>
      <div className={styles.card}>
        <img src="/logo.png" alt="PrEqtLogo" className={styles.logo} />
        <h2 className={styles.title}>Welcome Back</h2>
        <p className={styles.subtitle}>Sign in to your PrEqt Account</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.toggleGroup}>
            <button
              type="button"
              className={`${styles.toggleButton} ${
                mode === "phone" ? styles.toggleActive : ""
              }`}
              onClick={() => setMode("phone")}
            >
              Login With WhatsApp
            </button>
            <button
              type="button"
              className={`${styles.toggleButton} ${
                mode === "email" ? styles.toggleActive : ""
              }`}
              onClick={() => setMode("email")}
            >
              Login With Email
            </button>
          </div>
          <div className={styles.formGroup}>


        {mode === "phone" ? (
              <>
                <label className={styles.label}>WhatsApp Number</label>

            <div className={styles.phoneInputWrapper}>
              <div className={styles.countrySelect} ref={countrySelectRef}>
                <button
                  type="button"
                  className={styles.countryTrigger}
                  onClick={() => setIsCountryOpen((prev) => !prev)}
                >
                  {countryCode}
                  <span
                    className={`${styles.countryChevron} ${
                      isCountryOpen ? styles.countryChevronOpen : ""
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
                        className={`${styles.countryOption} ${
                          country.code === countryCode
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
                    placeholder="Enter WhatsApp Number"
                    value={phone}
                    onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 16);
                      setPhone(digitsOnly);
                    }}
                    inputMode="numeric"
                maxLength={16}
                  />
                </div>
              </>
            ) : (
              <>
                <label className={styles.label}>Email Address</label>
                <input
                  className={styles.input}
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </>
            )}
          </div>

          <button
            type="submit"
            className={`${styles.button} ${(!isFormValid || loading) ? styles.buttonDisabled : ""}`}
            disabled={!isFormValid || loading}
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
        </form>

        <p className={styles.footerText}>
          Don’t have an account?{" "}
          <button className={styles.link} onClick={onShowSignUp}>
            Sign up
          </button>
        </p>
      </div>
    </section>
  );
};

export default Signin;
