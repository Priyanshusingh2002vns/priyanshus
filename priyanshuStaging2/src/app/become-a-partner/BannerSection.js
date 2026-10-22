"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";
import ButtonAnimation from "../components/LandingPage/ButtonAnimation";
import AnimatedBtn from "../components/LandingPage/AnimatedBtn";
import { motion, AnimatePresence } from "framer-motion";
import { showErrorToast, showSuccessToast } from "../components/ToastProvider";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const OTP_LENGTH = 6;

// ✅ OTP Input Component
function OtpInputs({ otpValues, setOtpValues }) {
  const inputsRef = useRef([]);

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...otpValues];
    next[idx] = val;
    setOtpValues(next);
    if (val && idx < OTP_LENGTH - 1) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...otpValues];
      if (next[idx]) {
        next[idx] = "";
        setOtpValues(next);
        return;
      }
      if (idx > 0) {
        inputsRef.current[idx - 1]?.focus();
        next[idx - 1] = "";
        setOtpValues(next);
      }
    }
  };

  const handlePaste = (e, start = 0) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData("text");
    const digits = paste.replace(/\D/g, "").slice(0, OTP_LENGTH - start).split("");
    if (!digits.length) return;
    const next = [...otpValues];
    for (let i = 0; i < digits.length; i++) {
      next[start + i] = digits[i];
    }
    setOtpValues(next);
  };

  return (
    <div className={styles.otpContainer}>
      {Array.from({ length: OTP_LENGTH }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (inputsRef.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className={`${styles.otpInput} ${otpValues[idx] ? styles.otpInputFilled : ""}`}
          value={otpValues[idx]}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={(e) => handlePaste(e, idx)}
        />
      ))}
    </div>
  );
}

const BannerSectionContent = () => {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState("verify");
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [timeLeft, setTimeLeft] = useState(59);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef(null);

  // Step 2 + 3 data
  const [selectedProfile, setSelectedProfile] = useState("");
  const [otherProfile, setOtherProfile] = useState("");
  const [entityName, setEntityName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [location, setLocation] = useState("");
  const [comments, setComments] = useState("");
  const [assetTier, setAssetTier] = useState("Below ₹25 Cr");
  const { executeRecaptcha } = useGoogleReCaptcha();

  const getRecaptchaToken = async (action) => {
    if (!executeRecaptcha) {
      showErrorToast("reCAPTCHA is not ready yet. Please try again.");
      return null;
    }
    try {
      return await executeRecaptcha(action);
    } catch (err) {
      console.error("reCAPTCHA execution failed:", err);
      showErrorToast("Could not verify reCAPTCHA. Please try again.");
      return null;
    }
  };

  // Timer logic
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerActive, timeLeft]);

  const handleResend = () => {
    setTimeLeft(59);
    setIsTimerActive(true);
    handleSendVerification();
  };

  // ✅ Send Verification API
  const handleSendVerification = async () => {
    if (isSendingVerification) return;
    if (!email.trim() || !fullName.trim()) {
      showErrorToast("Please enter your full name and email before verifying.");
      return;
    }

    const token = await getRecaptchaToken("partner_send_verification");
    if (!token) return;

    try {
      setIsSendingVerification(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/partner-req/send-verification-mail`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), name: fullName.trim(), recaptchaToken: token }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setStatus("pending");
        setIsTimerActive(true);
        setTimeLeft(59);
        showSuccessToast("Verification mail sent successfully!");
      } else {
        showErrorToast(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      showErrorToast("Network error. Please try again later.");
    } finally {
      setIsSendingVerification(false);
    }
  };

  // ✅ Verify OTP API
  const handleVerifyOtp = async () => {
    const otp = otpValues.join("");
    if (otp.length !== OTP_LENGTH) {
      showErrorToast("Please enter complete 6-digit OTP.");
      return;
    }

    const token = await getRecaptchaToken("partner_verify_email");
    if (!token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/partner-req/verify-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), otp, recaptchaToken: token }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setStatus("verified");
        setIsTimerActive(false);
        showSuccessToast(data.message || "Email verified successfully!");
      } else {
        showErrorToast(data.message || "Invalid or expired OTP.");
      }
    } catch {
      showErrorToast("Network error. Please try again later.");
    }
  };

  // ✅ Step Navigation Validation
  const handleApplyClick = () => {
    if (!fullName.trim() || !email.trim() || !phoneNumber.trim()) {
      showErrorToast("Please fill out all required fields.");
      return;
    }
    if (status !== "verified") {
      showErrorToast("Please verify your email before continuing.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = () => {
    if (!selectedProfile) {
      showErrorToast("Please select your profile.");
      return;
    }
    if (selectedProfile === "Other" && !otherProfile.trim()) {
      showErrorToast("Please specify your profile.");
      return;
    }
    if (!entityName.trim()) {
      showErrorToast("Please enter your entity name.");
      return;
    }
    setStep(3);
  };

  // ✅ Final Register API
  const handleFinalSubmit = async () => {
    if (status !== "verified") {
      showErrorToast("Please verify your email before submitting.");
      return;
    }

    if (!entityName.trim() || !selectedProfile.trim()) {
      showErrorToast("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);

    const token = await getRecaptchaToken("partner_register");
    if (!token) {
      setIsSubmitting(false);
      return;
    }

    const payload = {
      full_name: fullName.trim(),
      profile: selectedProfile === "Other" ? otherProfile.trim() : selectedProfile,
      email: email.trim(),
      contact_no: phoneNumber.trim(),
      entity_name: entityName.trim(),
      company_website: companyWebsite.trim() || "N.A",
      linkedin_url: linkedinUrl.trim() || "N.A",
      location: location.trim() || "N.A",
      asset_tier: assetTier,
      comment: comments.trim() || "N.A",
      recaptchaToken: token,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/partner-req/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (res.ok) {
        showSuccessToast("🎉 Partner registered successfully!");
        setStep(1);
        setFullName("");
        setEmail("");
        setPhoneNumber("");
        setEntityName("");
        setLinkedinUrl("");
        setCompanyWebsite("");
        setLocation("");
        setComments("");
        setSelectedProfile("");
        setOtherProfile("");
        setStatus("verify");
        localStorage.removeItem("registerFormData")
      } else {
        showErrorToast(data.message || "❌ Failed to register partner.");
      }
    } catch (err) {
      showErrorToast("Network error while registering partner.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileSelect = (profile) => setSelectedProfile(profile);

  return (
    <section className={styles.bannerSection}>
      <div className="container">
        <div className={styles.contentSection}>
          <div className={styles.textSection}>
            <div style={{ maxWidth: "fit-content" }}>
              <ButtonAnimation text="Partner with PrEqt" />
            </div>
            <h1>
              India's First Partner-Driven Investment Network For Private Equity, IPOs & Fundraising
            </h1>
            <p>
              Join India's fastest-growing partner network for private market investments —
              pre-IPO, unlisted, and private equity deals.
            </p>
          </div>

          <div className={styles.partnerForn}>
            <AnimatePresence mode="wait">
              {/* STEP 1 */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2>Become an Associate Partner</h2>
                  {/* <p>Please verify your email to continue.</p> */}

                  {/* Full Name, Email, OTP */}
                  <div className={styles.formMainGroup}>
                    {/* Full Name */}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Full Name*</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>

                    {/* Email */}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Email*</label>
                      <div className={styles["email-input-wrapper"]}>
                        <input
                          type="email"
                          className={`${styles.input} ${status === "verified"
                            ? styles["email-verified-border"]
                            : styles["email-pending-border"]
                            }`}
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <div className={styles["email-status-inside"]}>
                          {status === "verify" && (
                            <button
                              className={styles.otpSubmit}
                              onClick={handleSendVerification}
                              type="button"
                              disabled={isSendingVerification}
                              aria-busy={isSendingVerification}
                            >
                              {isSendingVerification ? (
                                <span className={styles.spinner} aria-hidden="true" />
                              ) : (
                                "Verify"
                              )}
                            </button>
                          )}
                          {status === "pending" && (
                            <div className={styles["email-pending-cont"]}>
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.4856 12.0005L9.15231 2.66714C9.03602 2.46194 8.86738 2.29127 8.66359 2.17252C8.45981 2.05378 8.22817 1.99121 7.99231 1.99121C7.75645 1.99121 7.52481 2.05378 7.32103 2.17252C7.11724 2.29127 6.9486 2.46194 6.83231 2.66714L1.49898 12.0005C1.38143 12.204 1.3198 12.4351 1.32032 12.6701C1.32084 12.9052 1.3835 13.136 1.50194 13.339C1.62039 13.5421 1.79041 13.7102 1.99477 13.8264C2.19914 13.9425 2.43058 14.0026 2.66564 14.0005H13.3323C13.5662 14.0002 13.796 13.9385 13.9985 13.8213C14.201 13.7042 14.3691 13.5359 14.486 13.3332C14.6028 13.1306 14.6643 12.9007 14.6643 12.6668C14.6642 12.4329 14.6026 12.2031 14.4856 12.0005Z"
                                  stroke="#EA580C"
                                  strokeWidth="1.33333"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M8 6V8.66667"
                                  stroke="#EA580C"
                                  strokeWidth="1.33333"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M8 11.333H8.00533"
                                  stroke="#EA580C"
                                  strokeWidth="1.33333"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span className={styles["email-pending-text"]}>Pending</span>
                            </div>
                          )}

                          {status === "verified" && (
                            <div className={styles["email-pending-cont"]}>
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <circle cx="8" cy="8" r="6.5" stroke="#16A34A" strokeWidth="1.33333" />
                                <path
                                  d="M5 8L7 10L11 6"
                                  stroke="#16A34A"
                                  strokeWidth="1.33333"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span className={styles["email-verified-text"]}>Verified</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* OTP */}
                    {status === "pending" && (
                      <div className={styles.formGroup}>
                        <div className={styles.otpRow}>
                          <OtpInputs otpValues={otpValues} setOtpValues={setOtpValues} />
                          <button className={styles.otpSubmit} onClick={handleVerifyOtp}>
                            Submit
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Phone */}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Phone Number*</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Enter your phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div onClick={handleApplyClick}>
                    <AnimatedBtn text="Apply as Partner" fullWidth={true} />
                  </div>
                </motion.div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.4 }}
                  className={styles.profileForm}

                >
                  <h2>Become an Associate Partner</h2>

                  <div className={styles.yourprofile}>
                    <p>Select your Profile</p>
                    <div className={styles.profileOptions}>
                      {[
                        "Wealth Manager",
                        "Family Office",
                        "Independent Financial Advisor",
                        "Fund Manager",
                        "Independent Consultant",
                        "Other",
                      ].map((profile) => (
                        <label
                          key={profile}
                          className={`${styles.radioOption} ${selectedProfile === profile ? styles.selectedRadio : ""
                            }`}
                        >
                          <input
                            type="radio"
                            name="profile"
                            value={profile}
                            checked={selectedProfile === profile}
                            onChange={() => handleProfileSelect(profile)}
                            className={styles.radioInput}
                          />
                          <span className={styles.radioCircle}></span>
                          <span className={styles.radioLabelText}>{profile}</span>
                        </label>
                      ))}
                    </div>
                  </div>


                  {selectedProfile === "Other" && (
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Specify Other Profile*</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Enter your profile type"
                        value={otherProfile}
                        onChange={(e) => setOtherProfile(e.target.value)}
                      />
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Legal Name Of Your Entity*</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Enter your entity name"
                      value={entityName}
                      onChange={(e) => setEntityName(e.target.value)}
                    />
                  </div>

                  <div onClick={handleSubmit}>
                    <AnimatedBtn text="Next" fullWidth={true} />
                  </div>
                </motion.div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.4 }}
                  className={styles.provideCompanyDetails}
                >
                  <h2>Provide Your Company Details</h2>

                  <div className={styles.formMainGroup}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Company Website</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="If none, type N.A"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>LinkedIn URL</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Enter your LinkedIn URL"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Location</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Enter your location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Comments</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Enter any comments"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                      />
                    </div>
                  </div>

                  <div onClick={!isSubmitting ? handleFinalSubmit : undefined}>
                    <AnimatedBtn
                      text={isSubmitting ? "Submitting..." : "Submit & Continue"}
                      fullWidth={true}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSectionContent;
