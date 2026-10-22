import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import styles from "./Fundraise.module.css";
import Image from "next/image";
import Link from "next/link";
import { showErrorToast, showSuccessToast } from "../../components/ToastProvider";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const OTP_LENGTH = 6;

function OtpInputs({ otpValues, setOtpValues, errors }) {
  const inputsRef = useRef([]);

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...otpValues];
    next[idx] = val;
    setOtpValues(next);

    if (val && idx < OTP_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
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

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData("text");
    const digits = paste.replace(/\D/g, "");

    if (digits.length < OTP_LENGTH) {
      showErrorToast("Please paste full 6-digit OTP");
      return;
    }

    const arr = digits.slice(0, OTP_LENGTH).split("");
    setOtpValues(arr);

    inputsRef.current[OTP_LENGTH - 1]?.focus();
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
          className={`${styles.otpInput} 
            ${otpValues[idx] ? styles.otpInputFilled : ""} 
            ${errors?.otp ? styles.otpError : ""}
          `}
          value={otpValues[idx]}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={(e) => handlePaste(e)}
        />
      ))}
    </div>
  );
}


const StepIndicator = ({ step, total = 6 }) => {
  return (
    <div className={styles.stepIndicatorWrapper}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index + 1 <= step;
        return (
          <div
            key={index}
            className={`${styles.stepDot} ${isActive ? styles.activeDot : ""}`}
          />
        );
      })}
    </div>
  );
};

const FundraiseFrom = ({ isOpen, onClose }) => {
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);
  const [step, setStep] = useState(1);
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(""));
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [stageBusiness, setStageBusiness] = useState("");
  const [amount, setAmount] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [aboutCompany, setAboutCompany] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [source, setSource] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadedPitchDeck, setUploadedPitchDeck] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Validation functions
  const validateStep1 = () => {
    if (!email) return { email: "Email is required" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return { email: "Enter a valid company email" };
    return {};
  };

  const validateStep2 = () => {
    const otp = otpValues.join("");
    if (otp.length !== 6) {
      return { otp: "Please enter a valid 6-digit OTP" };
    }
    return {};
  };

  const validateStep3 = () => {
    if (!companyName) return { companyName: "Company name is required" };
    if (!industry) return { industry: "Please select industry" };
    if (!stageBusiness) return { stageBusiness: "Please select Business stage" }
    return {};
  };

  const validateStep4 = () => {
    if (!companyType) return { companyType: "Select company type" };
    if (!amount) return { amount: "Enter amount" };
    return {};
  };

  const validateStep5 = () => {
    if (!aboutCompany) return { aboutCompany: "Company description required" };
    if (!selectedFile) return { selectedFile: "Please upload your pitch deck (PDF)" };


    // Optional: File type validation
    const validTypes = ["application/pdf"];
    if (!validTypes.includes(selectedFile.type)) {
      return { selectedFile: "Only PDF files are allowed" };
    }

    // Optional: Size limit (10 MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      return { selectedFile: "Max file size allowed is 10MB" };
    }

    if (!uploadedPitchDeck) {
  return { selectedFile: "Your pitch deck is still uploading. Please wait." };
}


    return {};
  };



  const validateStep6 = () => {
    if (!fullName) return { fullName: "Full name required" };
    if (!phoneNumber || phoneNumber.length !== 10)
      return { phoneNumber: "Enter valid 10-digit number" };
    return {};
  };

  const getRecaptchaToken = async (action) => {
    if (!executeRecaptcha) {
      showErrorToast("reCAPTCHA is not ready yet. Please try again.");
      return null;
    }
    try {
      return await executeRecaptcha(action);
    } catch (error) {
      console.error("reCAPTCHA execution failed:", error);
      showErrorToast("Unable to verify reCAPTCHA. Please try again.");
      return null;
    }
  };

  // const nextStep = () => {
  //   let err = {};

  //   if (step === 1) err = validateStep1();
  //   if (step === 2) err = validateStep2();
  //   if (step === 3) err = validateStep3();
  //   if (step === 4) err = validateStep4();
  //   if (step === 5) err = validateStep5();
  //   if (step === 6) err = validateStep6();

  //   if (Object.keys(err).length > 0) {
  //     setErrors(err);
  //     return;
  //   }

  //   setErrors({});
  //   setStep(step + 1);
  // };

  useEffect(() => {
    if (isOpen || showSuccess) {
      document.documentElement.style.setProperty("overflow", "hidden", "important");
      document.body.style.setProperty("overflow", "hidden", "important");
      document.body.style.setProperty("position", "fixed", "important");
      document.body.style.setProperty("width", "100%", "important");
    } else {
      document.documentElement.style.setProperty("overflow", "", "important");
      document.body.style.setProperty("overflow", "", "important");
      document.body.style.setProperty("position", "", "important");
      document.body.style.setProperty("width", "", "important");
    }
    return () => {
      document.documentElement.style.setProperty("overflow", "", "important");
      document.body.style.setProperty("overflow", "", "important");
      document.body.style.setProperty("position", "", "important");
      document.body.style.setProperty("width", "", "important");
    };
  }, [isOpen, showSuccess]);




    const handleFileSelect = async (file) => {
    setErrors({});

    if (!file) return;

    // Validate only JPEG or PNG
    if (file.type !== "application/pdf") {
    setErrors({ selectedFile: "Only PDF files are allowed." });
    return;
  }

    setSelectedFile(file);

    console.log("selected file : ", file)

    // Auto-upload the image
     await uploadImageToServer(file);
  };


  const uploadImageToServer = async (file) => {
    try {
      const formData = new FormData();
      formData.append("files", file);
       formData.append("type", "test");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/uploads/data-uplpoad-files`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.log("Upload failed:", result.message);
        return setErrors({ selectedFile: result.message || "File upload failed" });
      }

      console.log("Upload Success:", result.files);

      setUploadedPitchDeck(result.files);

      // You can store URL or response data if needed
    } catch (err) {
      console.error("Upload Error:", err);
      setErrors({ selectedFile: err.message });
    }
  };


  // API Integration - Handle form submission
  const handleSubmit = async () => {
    // Step 6 Final Validation With Toast
    if (!fullName.trim()) {
      showErrorToast("Full name is required");
      return;
    }

    if (!phoneNumber || phoneNumber.length !== 10) {
      showErrorToast("Enter a valid 10-digit phone number");
      return;
    }

    if (!source) {
      showErrorToast("Please select how you heard about us");
      return;
    }

    const token = await getRecaptchaToken("fundraise_submit");
    if (!token) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare pitch deck document array
    const pitchDeckDocument = uploadedPitchDeck || [];
      
      const payload = {
        company_name: companyName,
        sector_industry: industry,
        amount_want_to_raise: parseFloat(amount) || 0,
        about_company: aboutCompany,
        pitch_deck_document: pitchDeckDocument,
        name: fullName,
        email: email,
        phone: phoneNumber,
        how_did_you_here: source,
        recaptchaToken: token,
        company_stage: stageBusiness,
        company_type: companyType
      };

      // Make API call
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/deal/sourcing/apply/to/raise/on/preqty`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        showErrorToast(result.message || "Something went wrong while submitting.");
        return;
      }

      showSuccessToast("Form submitted successfully!");
      setShowSuccess(true);

    } catch (error) {
      console.error("❌ API Error:", error);
      showErrorToast("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };



  // ------------------------
  // 🔹 SEND OTP API
  // ------------------------
  const sendOtp = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/deal/sourcing/apply/to/raise/on/preqty/send/otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      console.log("OTP SEND RESPONSE:", data);

      if (!res.ok) {
        showErrorToast(data.message || "Failed to send OTP");
        return false;
      }

      showSuccessToast("OTP sent successfully!");

      // ⭐ START OTP TIMER HERE ⭐
      setTimer(60);
      setCanResend(false);

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      // ⭐ END TIMER ⭐

      return true;

    } catch (err) {
      console.log(err);
      showErrorToast("Unable to send OTP. Try again.");
      return false;
    }
  };


  // ------------------------
  // 🔹 VERIFY OTP API
  // ------------------------
  const verifyOtp = async () => {
    const otp = otpValues.join("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/deal/sourcing/apply/to/raise/on/preqty/send/verify/otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await res.json();
      console.log("OTP VERIFY RESPONSE:", data);

      if (!res.ok) {
        showErrorToast(data.message || "Invalid OTP");
        return false;
      }
      showSuccessToast("OTP verified successfully!");
      return true;
    } catch (err) {
      console.log(err);
      showErrorToast("Failed to verify OTP");
      return false;
    }
  };

  // const nextStep = async () => {
  //   let err = {};

  //   if (step === 1) {
  //     err = validateStep1();
  //     if (Object.keys(err).length > 0) return setErrors(err);

  //     const ok = await sendOtp();
  //     if (!ok) return;
  //   }

  //   if (step === 2) {
  //     err = validateStep2();
  //     if (Object.keys(err).length > 0) return setErrors(err);

  //     const ok = await verifyOtp();
  //     if (!ok) return;
  //   }

  //   if (step === 3) err = validateStep3();
  //   if (step === 4) err = validateStep4();
  //   if (step === 5) err = validateStep5();
  //   if (step === 6) err = validateStep6();

  //   if (Object.keys(err).length > 0) {
  //     setErrors(err);
  //     return;
  //   }

  //   setErrors({});
  //   setStep(step + 1);
  // };

  const nextStep = async () => {
    let err = {};

    // Step 1 validation + OTP send
    if (step === 1) {
      err = validateStep1();
      if (Object.keys(err).length > 0) {
        showErrorToast(err.email);
        return;
      }

      const ok = await sendOtp();
      if (!ok) return;
    }

    // Step 2 validation + OTP verify
    if (step === 2) {
      err = validateStep2();
      if (Object.keys(err).length > 0) {
        showErrorToast(err.otp);
        return;
      }

      const ok = await verifyOtp();
      if (!ok) return;
    }

    // Normal Form Steps
    if (step === 3) {
      err = validateStep3();
      if (err.companyName) return showErrorToast(err.companyName);
      if (err.industry) return showErrorToast(err.industry);
      if (err.stageBusiness) return showErrorToast(err.stageBusiness);
    }

    if (step === 4) {
      err = validateStep4();
      if (err.companyType) return showErrorToast(err.companyType);
      if (err.amount) return showErrorToast(err.amount);
    }

    if (step === 5) {
      err = validateStep5();
      if (err.aboutCompany) return showErrorToast(err.aboutCompany);
      if (err.selectedFile) return showErrorToast(err.selectedFile);
    }

    if (step === 6) {
      err = validateStep6();
      if (err.fullName) return showErrorToast(err.fullName);
      if (err.phoneNumber) return showErrorToast(err.phoneNumber);
    }

    setStep(step + 1);
  };






  const handleCloseSuccess = () => {
    setShowSuccess(false);
    onClose();
    // Reset form
    setStep(1);
    setOtpValues(Array(OTP_LENGTH).fill(""));
    setFullName("");
    setCompanyName("");
    setIndustry("");
    setStageBusiness("");
    setAmount("");
    setCompanyType("");
    setAboutCompany("");
    setSelectedFile(null);
    setEmail("");
    setPhoneNumber("");
    setSource("");
    setErrors({});
  };



  return (
    <>

      <AnimatePresence>
        {isOpen && !showSuccess && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.modal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.formNav}>
                <Link href="" className={styles.fromNavLogo} onClick={handleCloseSuccess}>
                  <img src="/private-logo.png" alt="private-logo" />
                </Link>
                <div>
                  <StepIndicator step={step} />
                </div>
                <button className={styles.closeBtn} onClick={handleCloseSuccess}>
                  ✕
                </button>
              </div>
              <div className={styles.fundFormContainer}>
                {step == 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className={styles.fundForm}
                  >
                    <h2 className={styles.letsStartText}>Let's Start with Your Business Email</h2>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Enter your official company email</label>
                      <input
                        type="Email"
                        className={styles.input}
                        placeholder="e.g. you@company.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrors({});
                        }}
                      />
                      {errors.email && <p className={styles.errorText}>{errors.email}</p>}
                    </div>
                    <button className={styles.sendBtn} onClick={nextStep}>
                      Send OTP
                    </button>
                  </motion.div>
                )}

                {step == 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className={styles.fundForm}
                  >
                    <h2 className={styles.letsStartText}>Enter OTP to verify</h2>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Enter 6 digit OTP</label>
                      <div className={styles.otpBox}>
                        <OtpInputs
                          otpValues={otpValues}
                          setOtpValues={setOtpValues}
                        />
                        {/* <div className={styles.resendTime}>
                          Resend OTP in <span>00:46</span> seconds
                        </div> */}
                        <div className={styles.resendTimeBox}>
                          {!canResend ? (
                            <p className={styles.resendTime}>
                              Resend OTP in{" "}
                              <span className={styles.timerCount}>
                                {String(Math.floor(timer / 60)).padStart(2, "0")}:
                                {String(timer % 60).padStart(2, "0")}
                              </span>
                              seconds
                            </p>
                          ) : (
                            <p className={styles.resentOtp}
                              onClick={() => sendOtp()}
                            >
                              Resend OTP
                            </p>
                          )}
                        </div>
                      </div>
                      {errors.otp && <p className={styles.errorText}>{errors.otp}</p>}
                    </div>
                    <button className={styles.sendBtn} onClick={nextStep}>
                      Verify
                    </button>
                  </motion.div>
                )}

                {step == 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className={styles.fundForm}
                  >
                    <div className={styles.headingText}>
                      <h2 className={styles.letsStartText}>Tell Us About Your Company</h2>
                      <p>Help us understand your business before we proceed.</p>
                    </div>
                    <div className={styles.multiFieldsForm}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>What's your company name?</label>
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="Enter your company name"
                          value={companyName}
                          onChange={(e) => {
                            setCompanyName(e.target.value);
                            setErrors({});
                          }}
                        />
                        {errors.companyName && <p className={styles.errorText}>{errors.companyName}</p>}
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Which Sector Or Industry Does Your Company Operate In?</label>
                        <div className={styles.selectWrapper}>
                          <select
                            className={styles.input}
                            value={industry}
                            onChange={(e) => {
                              setIndustry(e.target.value);
                              setErrors({});
                            }}
                          >
                            <option value="">Select industry</option>
                            <option value="Technology">Sector</option>
                            <option value="Finance">Industry</option>
                            {/* <option value="">Select industry</option>
                            <option value="Technology">Technology</option>
                            <option value="Finance">Finance</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Education">Education</option>
                            <option value="Retail">Retail</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Construction">Construction</option>
                            <option value="Real Estate">Real Estate</option>
                            <option value="Hospitality">Hospitality</option>
                            <option value="Transportation">Transportation</option> */}
                          </select>
                          <img className={styles.dropdownIcon} src="/DownArrow.svg" alt="DownArrow" />
                        </div>
                        {errors.industry && <p className={styles.errorText}>{errors.industry}</p>}
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>What's the current stage of your business?</label>
                        <div className={styles.selectWrapper}>
                          <select
                            className={styles.input}
                            value={stageBusiness}
                            onChange={(e) => { setStageBusiness(e.target.value); setErrors({}) }}
                          >
                            <option value="">Select stage</option>
                            <option value="Early">Early</option>
                            <option value="Growth">Growth</option>
                            <option value="Pre-IPO">Pre-IPO</option>
                          </select>
                          <img className={styles.dropdownIcon} src="/DownArrow.svg" alt="DownArrow" />
                        </div>
                        {errors.stageBusiness && <p className={styles.errorText}>{errors.stageBusiness}</p>}
                      </div>
                    </div>
                    <button className={styles.sendBtn} onClick={nextStep}>
                      Continue
                    </button>
                  </motion.div>
                )}

                {step == 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className={styles.fundForm}
                  >
                    <div className={styles.headingText}>
                      <h2 className={styles.letsStartText}>Your Fundraising Goal</h2>
                      <p>Tell us how much you're raising and your company type.</p>
                    </div>
                    <div className={styles.multiFieldsForm}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>What type of company are you registered as?</label>
                        <div className={styles.selectWrapper}>
                          <select
                            className={styles.input}
                            value={companyType}
                            onChange={(e) => {
                              setCompanyType(e.target.value);
                              setErrors({});
                            }}
                          >
                            <option value="">Select type</option>
                            <option value="Private Limited">Startup</option>
                            <option value="Public Limited">SME</option>
                            {/* <option value="">Select company type</option>
                            <option value="Private Limited">Private Limited (Pvt Ltd)</option>
                            <option value="Public Limited">Public Limited</option>
                            <option value="LLP">Limited Liability Partnership (LLP)</option>
                            <option value="Partnership">Partnership Firm</option>
                            <option value="Proprietorship">Sole Proprietorship</option>
                            <option value="OPC">One Person Company (OPC)</option>
                            <option value="NGO">NGO / Section 8 Company</option> */}
                          </select>
                          <img className={styles.dropdownIcon} src="/DownArrow.svg" alt="DownArrow" />
                        </div>
                        {errors.companyType && <p className={styles.errorText}>{errors.companyType}</p>}
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>How much capital are you looking to raise?</label>
                        <div className={styles.rupeeCnt}>
                          <input
                            type="text"
                            className={styles.input}
                            placeholder="e.g. 5,00,00,000"
                            value={amount}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              setAmount(val);
                              setErrors({});
                            }}

                          />
                          <span className={styles.rupee}>₹</span>
                        </div>
                        {errors.amount && <p className={styles.errorText}>{errors.amount}</p>}
                      </div>
                    </div>
                    <button className={styles.sendBtn} onClick={nextStep}>
                      Continue
                    </button>
                  </motion.div>
                )}

                {step == 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className={styles.fundForm}
                  >
                    <div className={styles.headingText}>
                      <h2 className={styles.letsStartText}>Give Us a Snapshot of Your Company</h2>
                    </div>
                    <div className={styles.multiFieldsForm}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Can you describe your company in 1–2 lines?</label>
                        <textarea
                          type="text"
                          className={`${styles.input} ${styles.textArea}`}
                          placeholder="Tell us about your company"
                          value={aboutCompany}
                          onChange={(e) => { setAboutCompany(e.target.value); setErrors({}) }}
                        />
                        {errors.aboutCompany && <p className={styles.errorText}>{errors.aboutCompany}</p>}
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Please Upload Your Latest Pitch Deck (PDF).</label>

                        <div
                          className={`${styles.input} ${styles.uploadBox}`}
                          onClick={() => document.getElementById("fileUpload").click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            handleFileSelect(file);
                          }}
                        >
                          <div className={styles.uploadIconWrapper}>
                            <img src="/uploadFileIcon.svg" alt="uploadFileIcon" />
                          </div>
                          <p className={styles.uploadText}>
                            Drag your file(s) or <span className={styles.browse}>browse</span>
                          </p>

                          <input
                            id="fileUpload"
                            type="file"
                            accept="application/pdf"
                            hidden
                            onChange={(e) => handleFileSelect(e.target.files[0])}
                          />
                        </div>

                        {selectedFile && (
                          <p className={styles.selectedFileText}>Selected: {selectedFile.name}</p>
                        )}

                        {errors.selectedFile && (
                          <p className={styles.errorText}>{errors.selectedFile}</p>
                        )}
                      </div>

                    </div>
                    <button className={styles.sendBtn} onClick={nextStep}>
                      Continue
                    </button>
                  </motion.div>
                )}

                {step == 6 && (
                  <motion.div
                    key="step6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className={styles.fundForm}
                  >
                    <div className={styles.headingText}>
                      <h2 className={styles.letsStartText}>Who's Leading the Fundraise?</h2>
                      <p>Provide your contact details so our team can reach you.</p>
                    </div>
                    <div className={styles.multiFieldsForm}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>What's your full name as per official documents?</label>
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            setErrors({});
                          }}
                        />
                        {errors.fullName && <p className={styles.errorText}>{errors.fullName}</p>}
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>What's your contact number?</label>
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="Enter your contact number"
                          value={phoneNumber}
                          maxLength={10}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setPhoneNumber(val);
                            setErrors({});
                          }}
                        />
                        {errors.phoneNumber && <p className={styles.errorText}>{errors.phoneNumber}</p>}
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>How did you hear about PrEqt?</label>
                        <div className={styles.selectWrapper}>
                          <select
                            className={styles.input}
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                          >
                            <option value="">Select source</option>
                            <option value="Social Media">Social Media</option>
                            <option value="Google Search">Google Search</option>
                            <option value="Referral">Referral</option>
                            <option value="Event">Event</option>
                            <option value="Other">Other</option>
                          </select>
                          <img className={styles.dropdownIcon} src="/DownArrow.svg" alt="DownArrow" />
                        </div>
                      </div>
                    </div>
                    {errors.submit && <p className={styles.errorText}>{errors.submit}</p>}
                    <button
                      className={styles.sendBtn}
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit & Continue"}
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.modal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button className={`${styles.closeBtn} ${styles.closeBtnDone}`} onClick={handleCloseSuccess}>
                ✕
              </button>
              <div className={styles.fundFormContainer}>
                <motion.div
                  key="success"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className={`${styles.fundForm} ${styles.fundDoneForm}`}
                >
                  <div className={styles.imageGlowParent}>
                    <Image src="/DoneIcon.svg" className={styles.glowCardImg} height={200} width={200} alt="DoneIcon" />
                  </div>
                  <div>
                    <h2 className={styles.title}>Thank you for applying!</h2>
                    <p className={styles.textPara}>
                      Our investment team will review your submission within 3-5 working days.
                      <br />
                      If shortlisted, we'll reach out for a quick discussion to understand your business
                      <br />
                      and fundraising needs better.
                    </p>
                  </div>
                  <Link href="#" className={styles.poplink} onClick={handleCloseSuccess}>
                    Back to Home<img src="/rightArrow.svg" alt="rightArrow" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FundraiseFrom;