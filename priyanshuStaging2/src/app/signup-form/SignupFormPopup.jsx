"use client";
import { Modal } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";
import { useMultiStepContext } from "@/app/utils/MultiStepContext";
import styles from "./signup-form.module.css";
import { showErrorToast, showSuccessToast } from "../components/ToastProvider";
import Cookies from "js-cookie";
import { IoClose } from "react-icons/io5";
import Link from "next/link";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useSearchParams } from "next/navigation";

export default function SignupFormPopup({ show, onHide, onShowOtp, onBack, setSignupEmail }) {
  const { registerFormData, updateFormData, resetSignupForm } = useMultiStepContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setErrors] = useState({});
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const countrySelectRef = useRef(null);

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



  useEffect(() => {
    const referral = searchParams.get("r") || sessionStorage.getItem("referral");
    if (referral) {
      setReferralCode(referral);
    }
  }, [])

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

  // ✅ reCAPTCHA readiness tracker
  useEffect(() => {
    if (executeRecaptcha) {
      setRecaptchaReady(true);
    }
  }, [executeRecaptcha]);


  const validateLettersOnly = (value) => /^[a-zA-Z\s]*$/.test(value);

  const validateEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());

  const validatePhoneNumber = () => /^\d{8,16}$/.test(registerFormData.phonenumber);

  const handleEmailChange = (e) => {
    updateFormData("email", e.target.value);
    setErrors("");
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    if (validateLettersOnly(value)) {
      updateFormData("full_name", value);
      setErrors("");
    } else {
      showErrorToast("Name can only contain letters and spaces");
    }
  };

  const handleOrganizationChange = (e) => {
    const value = e.target.value;

    if (validateLettersOnly(value)) {
      updateFormData("organization", value);
      setErrors("");
    } else {
      showErrorToast("Organization name can only contain letters and spaces");
    }
  };

  const handleDesignation = (e) => {
    const value = e.target.value;
    if (validateLettersOnly(value)) {
      updateFormData("designation", value);
      setErrors("");
    } else {
      showErrorToast("Designation can only contain letters and spaces");
    }
  };

  const handlePhoneNumber = (e) => {
    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 16);
    updateFormData("phonenumber", cleaned);
  };


  const handlePhoneBlur = () => {
    const cleaned = registerFormData.phonenumber;

    if (cleaned.length === 0) return; // Don't show toast if empty

    if (cleaned.length < 8) {
      showErrorToast("Please enter a valid WhatsApp number");
      return;
    }

    if (!/^\d{8,16}$/.test(cleaned)) {
      showErrorToast("Invalid WhatsApp number");
    }
  };



  // ✅ Form Valid
  const isValid =
    registerFormData.full_name.trim().length > 1 &&
    validateEmail(registerFormData.email) &&
    /^\d{8,16}$/.test(registerFormData.phonenumber);


  const handleSubmit = async (e) => {
    e.preventDefault();

    // ---------------------------
    // ✅ Final Validation (Option 3)
    // ---------------------------

    if (registerFormData.full_name.trim().length <= 1) {
      showErrorToast("Please enter your full name");
      return;
    }

    if (!validateEmail(registerFormData.email)) {
      showErrorToast("Please enter a valid email address");
      return;
    }

    if (registerFormData.phonenumber.length < 8) {
      showErrorToast("Please enter a valid WhatsApp number");
      return;
    }

    if (!/^\d{8,16}$/.test(registerFormData.phonenumber)) {
      showErrorToast("Invalid WhatsApp number");
      return;
    }

    if (isSubmitting) return;

    // ---------------------------
    // ✅ reCAPTCHA Checks
    // ---------------------------

    if (!recaptchaReady || !executeRecaptcha) {
      showErrorToast("Security check loading, please try again...");
      return;
    }

    let token = null;

    try {
      token = await executeRecaptcha("signup_register");
    } catch (err) {
      console.error("Recaptcha error:", err);
      showErrorToast("Unable to verify reCAPTCHA. Please try again.");
      return;
    }

    if (!token) {
      showErrorToast("Unable to verify reCAPTCHA. Please try again.");
      return;
    }

    // ---------------------------
    // ✅ API Request
    // ---------------------------

    try {
      setIsSubmitting(true);

      const payload = {
        investor_type: registerFormData.investor_type || "Retail Investor",
        full_name: registerFormData.full_name,
        email: registerFormData.email,
        organization: registerFormData.organization,
        designation: registerFormData.designation,
        phone_number: `${countryCode}${registerFormData.phonenumber}`,
        recaptchaToken: token,
      };

      let api = `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/investor/register`;
      if (referralCode != "") {
        api += `?r=${referralCode}`;
      }

      const response = await fetch(
        api,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        showErrorToast(result.message || "Registration failed");
        throw new Error(result.message);
      }

      // ---------------------------
      // ✅ Success: Prepare OTP flow
      // ---------------------------

      Cookies.set("verifyOtp", true);
      localStorage.setItem("verifyEmail", registerFormData.email);
      sessionStorage.removeItem("referral")
      if (typeof setSignupEmail === "function") {
        setSignupEmail(registerFormData.email);
      }

      onShowOtp({
        email: registerFormData.email,
        phone: `${countryCode}${registerFormData.phonenumber}`,
      });

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueClick = () => {
    if (isSubmitting) return;

    if (registerFormData.full_name.trim().length <= 1) {
      showErrorToast("Please enter your full name");
      return;
    }

    if (!validateEmail(registerFormData.email)) {
      showErrorToast("Please enter a valid email address");
      return;
    }

    if (registerFormData.phonenumber.length < 8) {
      showErrorToast("Please enter a valid WhatsApp number");
      return;
    }

    if (!/^\d{8,16}$/.test(registerFormData.phonenumber)) {
      showErrorToast("Invalid WhatsApp number");
      return;
    }

    // If all good → trigger real submit
    handleSubmit(new Event("submit"));
  };



  useEffect(() => {
    if (show) {
      document.documentElement.style.setProperty("overflow", "hidden", "important");
      document.body.style.setProperty("overflow", "hidden", "important");
      document.body.style.setProperty("position", "fixed", "important");
      // stops touch scroll 
      document.body.style.setProperty("width", "100%", "important");
    } else {
      document.documentElement.style.setProperty("overflow", "", "important");
      document.body.style.setProperty("overflow", "", "important");
      document.body.style.setProperty("position", "", "important");
      document.body.style.setProperty("width", "", "important");
    } return () => {
      document.documentElement.style.setProperty("overflow", "", "important");
      document.body.style.setProperty("overflow", "", "important");
      document.body.style.setProperty("position", "", "important");
      document.body.style.setProperty("width", "", "important");
    };
  }, [show]);

  // useEffect(() => {
  //   if (!show) {
  //     resetSignupForm();
  //   }
  // }, [show]);

  const handleClose = () => {
    sessionStorage.setItem("showSignUp", false);
    resetSignupForm();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered dialogClassName={styles.customModalWrapper} backdrop="static">
      <section className={styles.wrapper}>
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
        >
          <IoClose />
        </button>

        <img src="/logo.png" alt="PrEqtLogo" className={styles.logo} />
        <div className={styles.titleWrapper}>
          <button type="button" className={styles.backBtn} onClick={onBack}>
            ←
          </button>
          <div>
            <h2 className={styles.title}>Tell Us About Yourself as an Investor</h2>
            <p className={styles.subtitle}>Your information helps us match you with the right IPO opportunities and provide a better experience.</p>
          </div>

        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Name as per Official documents</label>
            <input
              className={styles.input}
              placeholder="Enter your first name"
              value={registerFormData.full_name}
              onChange={(e) => handleNameChange(e)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              type="email"
              className={styles.input}
              placeholder="Enter your email address"
              value={registerFormData.email}
              onChange={handleEmailChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Organization</label>
            <input
              className={styles.input}
              placeholder="Enter your organisation name"
              value={registerFormData.organization}
              onChange={handleOrganizationChange}

            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Designation</label>
            <input
              className={styles.input}
              placeholder="Enter your designation"
              value={registerFormData.designation}
              onChange={handleDesignation}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Whatsapp Number</label>
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
                placeholder="Enter your WhatsApp number"
                value={registerFormData.phonenumber}
                onChange={handlePhoneNumber}
                onBlur={handlePhoneBlur}
                inputMode="numeric"
                maxLength={16}
              />
            </div>
          </div>

          <div className={styles.tc}>
            By continuing I accept Preqt{" "}
            <Link href="/terms-and-condition" className={styles.link}>
              Terms & Conditions
            </Link>
          </div>

          <button
            type="button"
            className={`${styles.button} ${!isValid || isSubmitting ? styles.buttonDisabled : ""}`}
            onClick={handleContinueClick}
          >
            Continue
          </button>
        </form>
      </section>
    </Modal>
  );
}
