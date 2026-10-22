"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import styles from "./otp.module.css";
import { showErrorToast, showSuccessToast } from "../components/ToastProvider";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { IoClose } from "react-icons/io5";
import { useMultiStepContext } from "../utils/MultiStepContext";
import { useUserContext } from "../context/UserContext";

export default function OtpPopup({
  show,
  handleClose,
  handleBack,
  flow,
  type,
  identifier,
  verifyEndpoint,
  resendEndpoint,
  email,
  subtitle,
  onVerified,
  redirectTo
}) {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [firstHit, setFirstHit] = useState(true);
  const inputRefs = useRef([]);
  const [seconds, setSeconds] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const router = useRouter();
  const { clearFormData } = useMultiStepContext();
  const { refreshInvestor } = useUserContext();


  const handleHidePopUp = () => {
    sessionStorage.setItem("showSignUp", false)
    handleClose();
  }

  // Reset OTP state whenever the popup is shown
useEffect(() => {
  if (!show) return;

  setOtp(new Array(6).fill(""));
  setFirstHit(true);
  setSeconds(30);
  setCanResend(false);
  setLoading(false);
  setIsResending(false);

  setTimeout(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, 0);
}, [show, type, identifier, verifyEndpoint]);


  useEffect(() => {
    if (show) { 
      console.log("OTP OPENED WITH CONFIG", {
        type,
        identifier,
        verifyEndpoint,
        resendEndpoint,
      });
    }
  }, [show, type, identifier]);

  // ⏱ Countdown logic
  useEffect(() => {
    if (seconds <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setSeconds((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const isValidOtp = useMemo(() => otp.every((digit) => /^\d$/.test(digit)), [otp]);

  useEffect(() => {
    if (
      firstHit &&
      show &&
      isValidOtp &&
      otp.join("").length === 6 &&
      !loading &&
      identifier &&
      verifyEndpoint
    ) {
      handleProceed(new Event("submit"));
      setFirstHit(false);
    }
  }, [otp, isValidOtp, loading, show]);

  useEffect(() => {
    if (otp.some((digit) => digit == "")) {
      setFirstHit(true);
    }
  }, [otp])


  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasteData) return;
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) newOtp[i] = pasteData[i] || "";
    setOtp(newOtp);
    const lastIndex = Math.min(pasteData.length, 6) - 1;
    if (lastIndex >= 0 && inputRefs.current[lastIndex]) {
      inputRefs.current[lastIndex].focus();
    }
  };

  const handleProceed = async (e) => {
    e?.preventDefault();
    if (!isValidOtp || loading) return;

    setLoading(true);
    const otpString = otp.join("");

    const payload =
      flow === "signup"
        ? { email, phone_number: identifier, otp: otpString }
        : type === "email"
          ? { email: identifier, otp: otpString }
          : { phone_number: identifier, otp: otpString };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/investor/${verifyEndpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        showErrorToast(data.message || "Something went wrong. Please try again.");
        return;
      }

      const token = data?.data?.data?.accessToken;
      const investor = data?.data?.data?.investor;

      
      if (token) {
        Cookies.set("accessToken", token, { path: "/" });
        window.dispatchEvent(new Event("tokenChanged"));
      }
      if (investor) {
        Cookies.set("investorName", investor.full_name, { path: "/", expires: 7 });
        Cookies.set(
          "investor",
          JSON.stringify({
            id: investor.id,
            name: investor.full_name,
            username: investor.user_name,
            email: investor.email,
            emailVerified: investor.email_verification_status,
            phone: investor.phone_number,
            type: investor.investor_type,
            organization: investor.organization,
            designation: investor.designation,
            location: investor.location,
          }),
          { path: "/", expires: 7 }
        );
      }

      showSuccessToast(
        type === "mobile"
          ? "Mobile number verified successfully!"
          : "Email verified successfully!"
      );

      await refreshInvestor?.();

      clearFormData();

      if (onVerified) {
        onVerified();
      } else if (redirectTo) {
        router.replace(redirectTo);
        router.refresh();
      } else {
        router.replace("/");
        router.refresh();
      }

      handleHidePopUp();
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResending) return;
    setIsResending(true);
    const payload =
      flow === "signup"
        ? { email, phone_number: identifier }
        : type === "email"
          ? { email: identifier }
          : { phone_number: identifier };
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/investor/${resendEndpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            payload
          ),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        showErrorToast(data.message || "Failed to resend OTP. Please try again.");
        return;
      }

      setSeconds(60);
      setCanResend(false);
      showSuccessToast("OTP has been resent to your email");
    } catch (error) {
      console.error("Resend OTP error:", error);
    } finally {
      setIsResending(false);
    }
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


  return (
    <Modal show={show} onHide={handleHidePopUp} centered dialogClassName={styles.customModalWrapper} backdrop="static">
      <section className={styles.wrapper}>

        <button
          type="button"
          className={styles.closeButton}
          onClick={handleHidePopUp}
        >
          <IoClose />
        </button>
        <img src="/logo.png" alt="PrEqtLogo" className={styles.logo} />

        <div className={styles.titleWrapper}>
          <button type="button" className={styles.backBtn} onClick={handleBack}>
            ←
          </button>
          <div>
            <h2 className={styles.title}>Enter OTP To Verify </h2>
            <p className={styles.subtitle}>
              {flow === "signup" ? (
                <>
                  Enter 6-digit OTP sent to{" "}
                  <b>{email ? `${identifier} / ${email}` : identifier}</b>
                </>
              ) : type === "mobile" ? (
                <>
                  Enter 6-digit OTP sent to{" "}
                  <b>{identifier}</b> or registered email
                </>
              ) : (
                <>
                  Enter 6-digit OTP sent to{" "}
                  <b>{identifier}</b> or registered WhatsApp number
                </>
              )}
            </p>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleProceed}>
          <div className={styles.formGroup}>
            <div className={styles.otpInputs}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  onPaste={handlePaste}
                  ref={(el) => (inputRefs.current[i] = el)}
                  className={styles.otpInput}
                />
              ))}
            </div>
          </div>

          <div className={styles.resendRow}>
            {canResend ? (
              <>
                <span 
                  className={isResending ? styles.resendButtonDisabled : styles.resendButton} 
                  onClick={handleResendOtp}
                >
                  {isResending ? "Resending..." : "Resend OTP"}
                </span>

                {type === "mobile" && (
                  <p className={styles.helperText} style={{ marginTop: "8px" }}>
                    Didn’t receive the OTP? Please check your WhatsApp number.
                  </p>
                )}
              </>
            ) : (
              <>
                Resend OTP in{" "}
                <span className={styles.timer}>
                  00:{String(seconds).padStart(2, "0")}
                </span>{" "}
                sec
              </>
            )}
          </div>


          <button
            type="submit"
            className={`${styles.button} ${(!isValidOtp || loading) ? styles.buttonDisabled : ""}`}
            disabled
          >
            {loading ? (
              <div className={styles.loaderWrapper}>
                <span className={styles.loader}></span>
                <span>Verifying...</span>
              </div>
            ) : (
              "Proceed"
            )}
          </button>
        </form>
      </section>
    </Modal>
  );
}
