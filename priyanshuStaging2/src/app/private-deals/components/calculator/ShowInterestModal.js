"use client";
import React, { useState, useEffect, useRef } from "react";
import Modal from "react-bootstrap/Modal";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import './Showintrest.css';
import BankSelect from "./CustomSelect";
import Cookies from "js-cookie";
import { showErrorToast, showSuccessToast } from "@/app/components/ToastProvider";
import styles from "../../../become-a-partner/page.module.css"
import { useSearchParams } from "next/navigation";
import { useUserContext } from "@/app/context/UserContext";
import LoaderScreen from "./LoaderScreen";
import SuccessScreen from "./SuccessScreen";
import ErrorScreen from "./ErrorScreen";
import AadhaarNumberForm from "./AadhaarNumberForm";

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

function OtpInputs({ otpValues, setOtpValues }) {
  const inputsRef = useRef([]);

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...otpValues];
    next[idx] = val;
    setOtpValues(next);
    if (val && idx < 6 - 1) inputsRef.current[idx + 1]?.focus();
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
    const digits = paste.replace(/\D/g, "").slice(0, 6 - start).split("");
    if (!digits.length) return;
    const next = [...otpValues];
    for (let i = 0; i < digits.length; i++) {
      next[start + i] = digits[i];
    }
    setOtpValues(next);
  };

  return (
    <div className={styles.otpContainer} style={{ minHeight: '70px' }}>
      {Array.from({ length: 6 }).map((_, idx) => (
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

// ✅ Helper function to get initial form data
const getInitialFormData = (deal_id, amount, lots) => {
  const baseData = {
    deal_id: deal_id,
    email: "",
    pan: "",
    applicantName: "",
    panNumber: "",
    aadhaarNumber: "",
    bank: "",
    accountNumber: "",
    confirmAccountNumber: "",
    amount: amount || "",
    lots: lots || 0,
    mobile: "",
    countryCode: "+91",
    address: "",
    fatherName: ""
  };

  // Try to load saved data from localStorage
  if (deal_id) {
    try {
      const savedData = localStorage.getItem(`showInterestForm_${deal_id}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return { ...baseData, ...parsed, amount, deal_id };
      }
    } catch (err) {
      console.error("Error loading saved form data:", err);
    }
  }
  return baseData;
};

const ShowInterestModal = ({ show = false, onClose = () => { }, lots, amount, deal_id, myStep = 1, fetchDealDetails, isunlisted }) => {
  const searchParams = useSearchParams();

  const [step, setStep] = useState(myStep);
  const [submitting, setSubmitting] = useState(false);
  const [transactionResult, setTransactionResult] = useState({});
  const accessToken = Cookies.get("accessToken");
  const [storeSession, setStoreSession] = useState({});
  const [fileUrl, setFileUrl] = useState({ fileUrl: "" });
  const [otpValues, setOtpValues] = useState(Array(6).fill(""));
  const [panCard, setPanCard] = useState({
    name: "XXXX XXXXX",
    number: "XXXXXXXXXX"
  })
  const [panVerificationMode, setPanVerificationMode] = useState("digilocker");
  const [panDigi, setPanDigi] = useState({
    code: "",
    state: "",
  });

  console.log("Received the Lots", lots);

  const [aadhaarDigi, setAadhaarDigi] = useState({
    code: "",
    state: "",
  });
  const [panReverifyUrl, setPanReverifyUrl] = useState("");
  const [aadhaarReverifyUrl, setAadhaarReverifyUrl] = useState("");
  const [isPanVerified, setIsPanVerified] = useState(false);

  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const countrySelectRef = useRef(null);

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

  const [requiredParams, setRequiredParams] = useState({
    transaction_id: "",
    session_id: "",
    digilocker_code: "",
    digilocker_transaction_id: ""
  })
  const [manualPan, setManualPan] = useState({
    name: "",
    pan: ""
  });
  const [panStatus, setPanStatus] = useState("idle");
  // idle | verifying | success | error
  const [aadhaarStatus, setAadhaarStatus] = useState("idle");
  /*
  idle
  verifying       // sending OTP
  otp_sent
  otp_verifying
  success
  details
  error
  */

  const [aadhaarVerificationMode, setAadhaarVerificationMode] = useState("digilocker");
  const [aadhaarData, setAadhaarData] = useState({
    number: "",
    otp: ""
  });
  const [aadhaarHolder, setAadhaarHolder] = useState({
    name: "XXXX XXXXX",
    maskedNumber: "XXXXXXXXXX"
  });
  const { investor } = useUserContext()
  const currentPath = window.location.origin + window.location.pathname;
  const panVerifyOnceRef = useRef(false);
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);
  const [aadhaarVerifiedVia, setAadhaarVerifiedVia] = useState(null);
  const aadhaarVerifyOnceRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) return;

    // Always persist raw callback
    Cookies.set("digi_code", code, { expires: 1 / 48 });
    Cookies.set("digi_state", state, { expires: 1 / 48 });

    const currentStep = Cookies.get("currentStep"); // "3" or "4"

    if (currentStep === "3") {
      Cookies.set("pan_digi_code", code, { expires: 1 / 48 });
      Cookies.set("pan_digi_state", state, { expires: 1 / 48 });
    }

    if (currentStep === "4") {
      Cookies.set("aadhaar_digi_code", code, { expires: 1 / 48 });
      Cookies.set("aadhaar_digi_state", state, { expires: 1 / 48 });
    }

    // Clean URL immediately
    window.history.replaceState({}, "", window.location.pathname);

  }, [searchParams]);


  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) return;

    if (step === 3) {
      setPanDigi({ code, state });
      // Clear Aadhaar digi params when setting PAN params
      setAadhaarDigi({ code: "", state: "" });
    }

    if (step === 4) {
      setAadhaarDigi({ code, state });
      // Clear PAN digi params when setting Aadhaar params
      setPanDigi({ code: "", state: "" });
    }
  }, [searchParams, step]);




  useEffect(() => {
    const keys = [
      "code",
      "state",
    ];

    // Build new params object only for existing values
    const newParams = {};

    keys.forEach((key) => {
      const value = searchParams.get(key);
      if (value) {
        if (key == "code") {
          newParams["digilocker_code"] = value;
        }
        if (key == "state") {
          newParams["digilocker_transaction_id"] = value;
        }
      }
    });
    let session = Cookies.get("session_id");
    let transaction = Cookies.get("transaction_id");
    newParams["session_id"] = session;
    newParams["transaction_id"] = transaction;

    // Update state once
    setRequiredParams((prev) => ({ ...prev, ...newParams }));
  }, [searchParams]);


  // ✅ Initialize with saved data from localStorage
  const [formData, setFormData] = useState(() => getInitialFormData(deal_id, amount, lots));

  // ✅ Update formData when deal_id changes (new deal)
  useEffect(() => {
    if (deal_id) {
      setFormData(getInitialFormData(deal_id, amount, lots));
    }
  }, [deal_id]);

  // ✅ Auto-save form data whenever it changes
  useEffect(() => {
    if (!deal_id) return;

    // Don't save if all fields are empty (initial state)
    const hasData = Object.values(formData).some(val =>
      val !== "" && val !== 0 && val !== deal_id
    );

    if (hasData) {
      localStorage.setItem(`showInterestForm_${deal_id}`, JSON.stringify(formData));
    }
  }, [formData, deal_id]);

  // ✅ Only populate from cookie if fields are empty (runs once when modal opens)
  useEffect(() => {
    if (!show || !investor) return;

    setFormData((prev) => {
      const updates = {};

      if (!prev.email && investor.email) {
        updates.email = investor.email || "";
      }

      if (!prev.applicantName && investor.full_name) {
        updates.applicantName = investor.full_name || "";
      }

      if (!prev.amount && amount) {
        updates.amount = amount;
      }

      if (investor.phone_number && !prev.mobile) {
        const phone = investor.phone_number || "";
        const matchingCountry = COUNTRY_DIAL_CODES.find(c => phone.startsWith(c.code));

        if (matchingCountry) {
          updates.countryCode = matchingCountry.code;
          updates.mobile = phone.slice(matchingCountry.code.length);
        } else {
          // Fallback if country code not found in list but starts with +
          // Or just set the whole thing if it doesn't match known codes
          updates.mobile = phone;
        }
      }

      // if (!prev.lots && lots) {
      //   updates.lots = lots;
      // }

      if (Object.keys(updates).length > 0) {
        return { ...prev, ...updates };
      }

      return prev;
    });
  }, [show, investor, amount, lots]);

  const handleClose = () => {
    setStep(1);
    setOtpValues(Array(6).fill(""));
    onClose();

  };

  const refreshData = () => {
    window.location.reload()
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "accountNumber" || name === "confirmAccountNumber") {
      const numericValue = value.replace(/\D/g, "").slice(0, 20);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (selected) => {
    if (!selected) return;
    setFormData(prev => ({ ...prev, bank: selected }));
  };

  const validateStep1 = () => {
    const { email, applicantName, mobile, address, fatherName } = formData;
    if (!email?.trim() || !applicantName?.trim() || !mobile?.trim() || !address?.trim() || !fatherName?.trim()) {
      showErrorToast("Please fill all required fields.");
      return false;
    }
    const emailRe = /^\S+@\S+\.\S+$/;
    if (!emailRe.test(email)) {
      showErrorToast("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const { bank, accountNumber, confirmAccountNumber, panNumber, aadhaarNumber } = formData;

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      showErrorToast("Enter a valid PAN number");
      return false;
    }

    if (formData.aadhaarNumber.length !== 12) {
      showErrorToast("Enter a valid 12-digit Aadhaar number");
      return false;
    }
    if (!bank?.toString()?.trim()) {
      showErrorToast("Please select a bank.");
      return false;
    }
    if (!accountNumber?.toString()?.trim() || !confirmAccountNumber?.toString()?.trim()) {
      showErrorToast("Please enter your account number and confirm it.");
      return false;
    }
    if (accountNumber !== confirmAccountNumber) {
      showErrorToast("Account numbers do not match.");
      return false;
    }
    if (accountNumber.length < 6) {
      showErrorToast("Please enter a valid account number.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!validateStep1()) return;
    }
    if (step < 7) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 3) {
      setPanDigi({ code: "", state: "" });
    }

    if (step === 4) {
      setAadhaarDigi({ code: "", state: "" });
    }
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    try {
      if (!validateStep2()) return;

      setSubmitting(true);

      if (!accessToken) {
        showErrorToast("User not authenticated. Please login again.");
        setSubmitting(false);
        return;
      }

      console.log("The log i gir", formData.lots)
      const API_URL = `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/transactions`;

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          deal_id: formData.deal_id,
          email: formData.email,
          applicant_name: formData.applicantName,
          aadhaar_number: formData.aadhaarNumber,
          pan_number: formData.panNumber,
          bank_name: formData.bank,
          account_number: formData.accountNumber,
          amount: amount,
          lots: lots,
          phone_no: `${formData.countryCode}${formData.mobile}`,
          address: formData.address,
          father_name: formData.fatherName
        }),
      });

      if (!response.ok) {
        let errorData = null;

        try {
          errorData = await response.json();
        } catch (e) {

        }

        showErrorToast(
          errorData?.message ||
          errorData?.statusText ||
          "Something went wrong while submitting. Please try again."
        );



        setSubmitting(false);
        return;
      }

      else {
        const result = await response.json();
        setTransactionResult(result.data);

        setPdfUrl(result?.data?.fileUrl);

        setTimeout(() => {
          setStep(3);
        }, 800);

        if (fetchDealDetails) {
          await fetchDealDetails();
        }

        // localStorage.removeItem(`showInterestForm_${deal_id}`);
      }

    } catch (error) {
      console.error("Error submitting form:", error);
      showErrorToast(error?.message || "Something went wrong while submitting. Please try again.");
    }
    finally {
      setSubmitting(false)
    }
  };

  // useEffect(() => {
  //   if (!transactionResult?.transaction?.id) return;

  //   checkPanStatus();
  // }, [transactionResult?.transaction?.id]);

  // const checkPanStatus = async () => {
  //   try {
  //     setPanStatus("verifying");

  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/transactions/e-sign/pan/digilocker/start`,
  //       {
  //         method: "POST",
  //         headers: {
  //           Accept: "application/json",
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //         body: JSON.stringify({
  //           transaction_id: transactionResult?.transaction?.id,
  //           callback_page: currentPath,
  //           user_email: formData.email,
  //           e_sign_form: transactionResult?.e_sign_doc,
  //         }),
  //       }
  //     );

  //     const result = await response.json();
  //     Cookies.set("session_id", result.data.session_id, { expires: 1 / 48 });

  //     if (!response.ok || !result.success) {
  //       setPanStatus("idle");
  //       return;
  //     }


  //     if (result?.data?.pan_number && result?.data?.name_on_pan) {
  //       setPanCard({
  //         number: result?.data?.pan_number,
  //         name: result?.data?.name_on_pan,
  //       });
  //       setIsPanVerified(true);

  //       setPanStatus("details"); 

  //       return;
  //     }

  //     setPanStatus("idle");


  //   } catch (err) {
  //     console.error("PAN status check failed", err);
  //     setPanStatus("idle");
  //   }
  // };



  // const verifyPan = async () => {
  //   try {
  //     setSubmitting(true);

  //     const API_URL = `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/transactions/e-sign/pan/digilocker/start`;

  //     const response = await fetch(API_URL, {
  //       method: "POST",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //       body: JSON.stringify({
  //         transaction_id: transactionResult?.transaction?.id,
  //         callback_page: currentPath,
  //         user_email: formData.email,
  //         e_sign_form: transactionResult?.e_sign_doc,
  //       }),
  //     });

  //     const result = await response.json();

  //     if (!response.ok || !result.success) {
  //       showErrorToast(result.message || "Something went wrong. Please try again.");
  //       return;
  //     }
  //     Cookies.set("session_id", result.data.session_id, { expires: 1 / 48 });

  //     if (result?.data?.redirect_url) {

  //       Cookies.set("transaction_id", transactionResult?.transaction?.id, { expires: 1 / 48 });

  //       Cookies.set("showinterest", true, { expires: 1 / 48 });
  //       Cookies.set("currentStep", 3, { expires: 1 / 48 });
  //       window.location.href = result?.data?.redirect_url;
  //     }
  //   } catch (error) {
  //     console.error("Error submitting form:", error);
  //     showErrorToast("Something went wrong while submitting. Please try again.");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  // useEffect(() => {
  //   if (step !== 3) return;
  //   if (panVerifyOnceRef.current) return;

  //   const code = Cookies.get("pan_digi_code");
  //   const state = Cookies.get("pan_digi_state");
  //   if (!code || !state) return;

  //   panVerifyOnceRef.current = true;
  //   handlePanVerificationCallback();
  // }, [step]);

  // const restartPanVerification = async () => {
  //   const sessionId =
  //     Cookies.get("session_id") ||
  //     requiredParams.session_id;
  //   try {
  //     setSubmitting(true);

  //     const API_URL = `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/transactions/e-sign/pan/digilocker/restart`;

  //     const response = await fetch(API_URL, {
  //       method: "POST",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //       body: JSON.stringify({
  //         transaction_id: transactionResult?.transaction?.id,
  //         callback_page: currentPath,
  //         session_id: sessionId,
  //       }),
  //     });

  //     const result = await response.json();

  //     if (!response.ok || !result.success) {
  //       showErrorToast(result.message || "Failed to restart PAN verification");
  //       return;
  //     }


  //     if (result?.data?.session_id) {
  //       Cookies.set("session_id", result.data.session_id, { expires: 1 / 48 });
  //     }

  //     if (result?.data?.redirection_url) {
  //       setPanReverifyUrl(result.data.redirection_url);
  //     }
  //     panVerifyOnceRef.current = false;

  //     setPanVerificationMode("reverification");
  //     setPanStatus("idle");
  //     setIsPanVerified(false);

  //     console.log("PAN verification mode changed to reverification", panVerificationMode);
  //     console.log("PAN status reset to idle", panStatus);

  //   } catch (err) {
  //     console.error("PAN restart error:", err);
  //     showErrorToast("Something went wrong while restarting PAN verification.");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };



  // const handlePanVerificationCallback = async () => {
  //   if (step !== 3) return;

  //   const code = Cookies.get("pan_digi_code");
  //   const state = Cookies.get("pan_digi_state");

  //   if (!code || !state) {
  //     console.warn("PAN Digilocker params missing in cookies");
  //     return;
  //   }

  //   const transactionId =
  //     transactionResult?.transaction?.id ||
  //     Cookies.get("transaction_id") ||
  //     requiredParams.transaction_id;

  //   const sessionId =
  //     Cookies.get("session_id") ||
  //     requiredParams.session_id;

  //   if (!transactionId || !sessionId) {
  //     showErrorToast("Transaction or Session ID missing");
  //     return;
  //   }

  //   try {
  //     setSubmitting(true);
  //     setPanStatus("verifying");

  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/transactions/e-sign/pan/digilocker/verify`,
  //       {
  //         method: "POST",
  //         headers: {
  //           Accept: "application/json",
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //         body: JSON.stringify({
  //           transaction_id: transactionId,
  //           session_id: sessionId,
  //           digilocker_code: code,
  //           digilocker_state: state,
  //         }),
  //       }
  //     );

  //     const result = await response.json();

  //     if (!response.ok || !result.success) {
  //       showErrorToast(result.message || "PAN verification failed");
  //       setPanStatus("error");
  //       setPanVerificationMode("manual");
  //       return;
  //     }

  //     showSuccessToast("PAN verified successfully");

  //     setPanCard({
  //       name: result?.data?.holder_name,
  //       number: result?.data?.pan_number,
  //     });

  //     setPanStatus("success");


  //     Cookies.remove("pan_digi_code");
  //     Cookies.remove("pan_digi_state");

  //     setTimeout(() => setPanStatus("details"), 3000);
  //   } catch (err) {
  //     setPanStatus("error");
  //     showErrorToast("Something went wrong");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };



  // const isValidPan = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);

  // const verifyPanManually = async () => {
  //   const name = manualPan.name?.trim();
  //   const pan = manualPan.pan?.trim().toUpperCase();


  //   if (!name) {
  //     showErrorToast("Name as per PAN is required");
  //     return;
  //   }

  //   if (!pan) {
  //     showErrorToast("PAN number is required");
  //     return;
  //   }


  //   if (!isValidPan(pan)) {
  //     showErrorToast("Please enter a valid PAN number");
  //     return;
  //   }

  //   try {
  //     setSubmitting(true);
  //     setPanStatus("verifying");

  //     const API_URL = `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/transactions/e-sign/pan/manual/verify`;

  //     const response = await fetch(API_URL, {
  //       method: "POST",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //       body: JSON.stringify({
  //         transaction_id: transactionResult?.transaction?.id,
  //         session_id: Cookies.get("session_id"),
  //         name_on_pan: name,
  //         pan_number: pan,
  //       }),
  //     });

  //     const result = await response.json();

  //     if (!response.ok || !result.success) {
  //       showErrorToast(result.message || "Manual PAN verification failed");
  //       setPanStatus("error");
  //       return;
  //     }

  //     showSuccessToast(result.message || "PAN verified successfully");

  //     setPanCard({
  //       name: result?.data?.holder_name,
  //       number: result?.data?.pan_number,
  //     });
  //     setPanStatus("success");

  //     setTimeout(() => {
  //       setPanStatus("details")
  //     }, 3000)

  //   } catch (error) {
  //     console.error("Manual PAN verification error:", error);
  //     setPanStatus("error");
  //     showErrorToast("Something went wrong");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  // const panInitializedRef = useRef(false);

  // const panUserActionRef = useRef(false);



  // const switchToManual = () => {
  //   panUserActionRef.current = true;
  //   setPanVerificationMode("manual");
  // };

  // const switchToDigilocker = () => {
  //   panUserActionRef.current = true;
  //   setPanVerificationMode("digilocker");
  // };



  // useEffect(() => {
  //   if (step !== 3) {
  //     panUserActionRef.current = false;
  //     return;
  //   }


  //   if (panUserActionRef.current) return;


  //   if (panVerificationMode === "reverification") return;


  //   if (panStatus === "details" || panStatus === "success") return;


  //   if (panStatus === "verifying") return;

  //   console.log("Initializing PAN flow for step 3");

  //   setPanStatus("idle");
  //   setPanVerificationMode("digilocker");
  //   setSubmitting(false);

  //   setManualPan({ name: "", pan: "" });
  //   setAadhaarDigi({ code: "", state: "" });

  // }, [step, panStatus, panVerificationMode]);




  // const handlePanErrorRetry = () => {
  //   setPanStatus("idle");
  //   setPanVerificationMode("digilocker");


  //   setSubmitting(false);


  // };

  // const handleAadhaarErrorRetry = () => {
  //   setAadhaarStatus("idle");
  //   setAadhaarVerificationMode("digilocker");


  //   setSubmitting(false);


  // };


  // const aadhaarUserActionRef = useRef(false);

  // const switchAadhaarToManual = () => {
  //   setAadhaarVerificationMode("manual");
  //   setAadhaarStatus("idle");
  // };

  // const switchAadhaarToDigilocker = () => {
  //   aadhaarUserActionRef.current = true;

  //   setAadhaarStatus("idle");
  //   setSubmitting(false);
  //   setAadhaarVerificationMode("digilocker");
  // };



  // useEffect(() => {
  //   if (step !== 4) return;


  //   const hasCallback =
  //     searchParams.get("code") && searchParams.get("state");

  //   if (hasCallback) return;

  //   if (aadhaarUserActionRef.current) return;
  //   if (aadhaarVerificationMode === "reverification") return;
  //   if (aadhaarStatus === "details" || aadhaarStatus === "success") return;

  //   setAadhaarStatus("idle");
  //   setAadhaarVerificationMode("digilocker");
  //   setSubmitting(false);

  //   setAadhaarData({ number: "", otp: "" });

  //   Cookies.remove("aadhaar_digi_code");
  //   Cookies.remove("aadhaar_digi_state");
  //   setAadhaarDigi({ code: "", state: "" });

  // }, [step, searchParams]);


  // const lastStepRef = useRef(null);

  // useEffect(() => {
  //   if (step !== 4) {
  //     lastStepRef.current = step;
  //     return;
  //   }


  //   if (lastStepRef.current !== 4) {

  //     setAadhaarVerificationMode("digilocker");
  //     setAadhaarStatus("idle");


  //     aadhaarVerifyOnceRef.current = false;
  //   }

  //   lastStepRef.current = step;
  // }, [step]);






  // const proceedToAadhaarVerification = async () => {
  //   try {
  //     setSubmitting(true);
  //     const transactionId =
  //       transactionResult?.transaction?.id ||
  //       Cookies.get("transaction_id") ||
  //       requiredParams.transaction_id;

  //     const sessionId =
  //       Cookies.get("session_id") ||
  //       requiredParams.session_id;

  //     if (!transactionId || !sessionId) {
  //       showErrorToast("Transaction or Session ID missing");
  //       return;
  //     }

  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/transactions/e-sign/aadhaar/digilocker/start`,
  //       {
  //         method: "POST",
  //         headers: {
  //           Accept: "application/json",
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //         body: JSON.stringify({
  //           transaction_id: transactionId,
  //           session_id: sessionId,
  //           callback_page: currentPath,
  //         }),
  //       }
  //     );

  //     const result = await response.json();

  //     if (!response.ok || !result.success) {
  //       setAadhaarStatus("idle");
  //       showErrorToast(result.message || "Failed to start Aadhaar verification");
  //       return;
  //     }


  //     if (result?.data?.session_id) {
  //       Cookies.set("session_id", result.data.session_id, { expires: 1 / 48 });
  //     }


  //     if (result?.data?.aadhaar_number && result?.data?.name_on_aadhaar) {
  //       setAadhaarHolder({
  //         name: result.data.name_on_aadhaar,
  //         maskedNumber: result.data.aadhaar_number,
  //       });

  //       setIsAadhaarVerified(true);
  //       setAadhaarStatus("details");
  //       setSubmitting(false);
  //       return;
  //     }



  //   } catch (err) {
  //     console.error("Aadhaar start error", err);
  //     setAadhaarStatus("idle");
  //     showErrorToast("Something went wrong");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  // const startAadhaarVerification = async () => {
  //   try {
  //     setSubmitting(true);

  //     const transactionId =
  //       transactionResult?.transaction?.id ||
  //       Cookies.get("transaction_id") ||
  //       requiredParams.transaction_id;

  //     const sessionId =
  //       Cookies.get("session_id") ||
  //       requiredParams.session_id;

  //     if (!transactionId || !sessionId) {
  //       showErrorToast("Transaction or Session ID missing");
  //       return;
  //     }

  //     if (!sessionId) {
  //       showErrorToast("Session ID is missing. Please try again.");
  //       setSubmitting(false);
  //       return;
  //     }

  //     const API_URL = `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/transactions/e-sign/aadhaar/digilocker/start`;

  //     const response = await fetch(API_URL, {
  //       method: "POST",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //       body: JSON.stringify({
  //         transaction_id: transactionId,
  //         session_id: sessionId,
  //         callback_page: currentPath,
  //       }),
  //     });

  //     const result = await response.json();

  //     if (!response.ok || !result.success) {
  //       showErrorToast(result.message || "Failed to start Aadhaar verification");
  //       return;
  //     }

  //     if (result?.data?.digilocker_auth_url) {
  //       Cookies.set("session_id", result.data.session_id, { expires: 1 / 48 });

  //       Cookies.set("showinterest", true, { expires: 1 / 48 });
  //       Cookies.set("currentStep", 4, { expires: 1 / 48 });
  //       window.location.href = result.data.digilocker_auth_url;
  //       // setAadhaarVerificationMode("manual");
  //     }

  //   } catch (err) {
  //     showErrorToast("Something went wrong");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };
  // useEffect(() => {
  //   if (step !== 4) return;
  //   if (aadhaarVerificationMode !== "digilocker") return;
  //   if (aadhaarVerifyOnceRef.current) return;

  //   const code = Cookies.get("aadhaar_digi_code");
  //   const state = Cookies.get("aadhaar_digi_state");

  //   if (!code || !state) return;

  //   aadhaarVerifyOnceRef.current = true;

  //   setAadhaarStatus("verifying");
  //   verifyAadhaarDigilocker();

  // }, [step, aadhaarVerificationMode]);



  // const restartAadharVerification = async () => {
  //   const sessionId =
  //     Cookies.get("session_id") ||
  //     requiredParams.session_id;
  //   try {
  //     setSubmitting(true);

  //     const API_URL = `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/transactions/e-sign/aadhaar/digilocker/restart`;

  //     const response = await fetch(API_URL, {
  //       method: "POST",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //       body: JSON.stringify({
  //         transaction_id: transactionResult?.transaction?.id,
  //         callback_page: currentPath,
  //         session_id: sessionId,
  //       }),
  //     });

  //     const result = await response.json();

  //     if (!response.ok || !result.success) {
  //       showErrorToast(result.message || "Failed to restart PAN verification");
  //       return;
  //     }


  //     if (result?.data?.session_id) {
  //       Cookies.set("session_id", result.data.session_id, { expires: 1 / 48 });
  //     }

  //     if (result?.data?.digilocker_auth_url) {
  //       setAadhaarReverifyUrl(result.data.digilocker_auth_url);
  //     }
  //     aadhaarVerifyOnceRef.current = false;

  //     setAadhaarVerificationMode("reverification");
  //     setAadhaarStatus("idle")
  //     setIsAadhaarVerified(false)

  //   } catch (err) {
  //     console.error("PAN restart error:", err);
  //     showErrorToast("Something went wrong while restarting PAN verification.");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };


  // const verifyAadhaarDigilocker = async () => {
  //   const code = Cookies.get("aadhaar_digi_code");
  //   const state = Cookies.get("aadhaar_digi_state");
  //   const transactionId =
  //     transactionResult?.transaction?.id ||
  //     Cookies.get("transaction_id") ||
  //     requiredParams.transaction_id;

  //   const sessionId =
  //     Cookies.get("session_id") ||
  //     requiredParams.session_id;

  //   if (!transactionId || !sessionId || !code || !state) {
  //     showErrorToast("Missing required parameters for Aadhaar verification");
  //     return;
  //   }

  //   try {
  //     setSubmitting(true);
  //     setAadhaarStatus("verifying");

  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/transactions/e-sign/aadhaar/digilocker/verify`,
  //       {
  //         method: "POST",
  //         headers: {
  //           Accept: "application/json",
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //         body: JSON.stringify({
  //           transaction_id: transactionId,
  //           session_id: sessionId,
  //           digilocker_code: code,
  //           digilocker_state: state,
  //         }),
  //       }
  //     );

  //     const result = await response.json();

  //     if (!response.ok || !result.success) {
  //       showErrorToast(result.message || "Aadhaar verification failed");
  //       setAadhaarStatus("error");
  //       setAadhaarVerificationMode("manual");
  //       Cookies.remove("aadhaar_digi_code");
  //       Cookies.remove("aadhaar_digi_state");
  //       return;
  //     }

  //     Cookies.remove("aadhaar_digi_code");
  //     Cookies.remove("aadhaar_digi_state");

  //     // ✅ SUCCESS
  //     showSuccessToast(result.message || "Aadhaar verified successfully");
  //     setAadhaarStatus("success");
  //     setTimeout(() => {
  //       setAadhaarStatus("details");
  //     }, 2000);
  //     setAadhaarHolder({
  //       name: result?.data?.name_on_aadhaar,
  //       maskedNumber: result?.data?.aadhaarNumber,
  //     });


  //     // Clear Aadhaar digilocker params after verification
  //     setAadhaarDigi({ code: "", state: "" });


  //   } catch (err) {
  //     console.error("Aadhaar digilocker verification error:", err);
  //     setAadhaarStatus("error");
  //     showErrorToast("Something went wrong");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };



  // const sendAadhaarOtp = async () => {
  //   if (!aadhaarData.number || aadhaarData.number.length !== 12) {
  //     showErrorToast("Enter valid Aadhaar number");
  //     return;
  //   }

  //   try {
  //     setSubmitting(true);
  //     setAadhaarStatus("verifying");

  //     const API_URL = `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/transactions/e-sign/aadhaar/manual/send-otp`;

  //     const response = await fetch(API_URL, {
  //       method: "POST",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //       body: JSON.stringify({
  //         transaction_id: transactionResult?.transaction?.id,
  //         session_id: Cookies.get("session_id"),
  //         aadhaar_number: aadhaarData.number,
  //       }),
  //     });

  //     const result = await response.json();

  //     if (!response.ok || !result.success) {
  //       setAadhaarStatus("error");
  //       showErrorToast(result.message || "OTP send failed");
  //       return;
  //     }

  //     setAadhaarStatus("otp_sent");
  //     showSuccessToast("OTP sent successfully");

  //   } catch (err) {
  //     setAadhaarStatus("error");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };


  // const verifyAadhaarOtp = async () => {
  //   const otp = otpValues.join("");

  //   if (otp.length !== 6) {
  //     showErrorToast("Please enter a valid 6-digit OTP");
  //     return;
  //   }

  //   try {
  //     setSubmitting(true);
  //     setAadhaarStatus("otp_verifying");

  //     const API_URL = `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/transactions/e-sign/aadhaar/manual/verify-otp`;

  //     const response = await fetch(API_URL, {
  //       method: "POST",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //       body: JSON.stringify({
  //         transaction_id: transactionResult?.transaction?.id,
  //         session_id: Cookies.get("session_id"),
  //         phone_number: formData.mobile,
  //         otp,
  //       }),
  //     });

  //     const result = await response.json();

  //     if (!response.ok || !result.success) {
  //       setAadhaarStatus("error");
  //       showErrorToast(result.message || "OTP verification failed");
  //       return;
  //     }


  //     setAadhaarHolder({
  //       name: result?.data?.name_on_aadhaar,
  //       maskedNumber: result?.data?.aadhaar_number,
  //     });

  //     setAadhaarStatus("success");


  //     setTimeout(() => {
  //       setAadhaarStatus("details");
  //     }, 3000);

  //   } catch (error) {
  //     console.error("Aadhaar OTP verification error:", error);
  //     setAadhaarStatus("error");
  //     showErrorToast("Something went wrong");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {

  })

  useEffect(() => {
    if (show) {
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
  }, [show]);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="md"
      dialogClassName={`success-interest-modalu ${isunlisted ? 'light-theme-modal' : ''}`}
      className={`success-interest-modalu ${isunlisted ? 'light-theme-modal' : ''}`}
      backdrop="static"
      keyboard={false}
    >
      {step < 4 && (
        <button
          className="back-arrow-btn"
          onClick={() => { step == 1 ? handleClose() : handleBack() }}
          aria-label="Go Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M18.6513 9.12663H3.10696L8.10144 4.13215C8.41172 3.82187 8.41172 3.32034 8.10144 3.01006C7.79096 2.69977 7.28944 2.69977 6.97915 3.01006L0.630009 9.35844C0.556866 9.43215 0.498961 9.52034 0.45858 9.61711C0.37839 9.81082 0.37839 10.0299 0.45858 10.2236C0.498961 10.3203 0.556866 10.4083 0.630009 10.4822L6.97915 16.8306C7.13382 16.9855 7.33706 17.0632 7.5403 17.0632C7.74334 17.0632 7.94658 16.9855 8.10144 16.8306C8.41172 16.5203 8.41172 16.0188 8.10144 15.7083L3.10696 10.7141H18.6513C19.0894 10.7141 19.4451 10.3584 19.4451 9.92034C19.4451 9.48225 19.0894 9.12663 18.6513 9.12663Z" fill={isunlisted ? "#1F2937" : "white"} />
          </svg>
        </button>
      )}
      <div className={`success-modal-content ${isunlisted ? 'text-black' : 'text-white'}`}>
        {/* Step 1 */}

        {step === 1 && (
          <>
            <div className="fillDetailsHead">
              <h5 className=" mb-2  text_left">Fill in details to confirm your interest</h5>
              <p className="small_text text-left mb-1">Private & confidential, not for circulation</p>
            </div>

            <div className="form-group mb-3">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className=""
                placeholder="Enter Email"
                autoComplete="off"
              />
            </div>

            {/* <div className="form-group mb-3">
              <label>PAN</label>
              <div className="inputBox">
                <input
                type="text"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                className="input_filed"
                placeholder="Enter PAN"
                autoComplete="off"
                maxLength={10}
              />
              </div>
            </div> */}

            <div className="form-group mb-3">
              <label>Name Of Applicant</label>
              <input
                type="text"
                name="applicantName"
                value={formData.applicantName}
                onChange={handleChange}
                className=""
                placeholder="Enter name"
                autoComplete="off"
              />
            </div>

            <div className="form-group mb-3">
              <label>Father's Name</label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                className=""
                placeholder="Enter Father's name"
                autoComplete="off"
              />
            </div>

            <div className="form-group mb-3" style={{ zIndex: 1001 }}>
              <label>Mobile Number</label>
              <div className="phoneInputWrapper">
                <div className="countrySelect" ref={countrySelectRef}>
                  <button
                    type="button"
                    className="countryTrigger"
                    onClick={() => setIsCountryOpen((prev) => !prev)}
                  >
                    {formData.countryCode}
                    <span
                      className={`countryChevron ${isCountryOpen ? "countryChevronOpen" : ""
                        }`}
                    >
                      ▾
                    </span>
                  </button>
                  {isCountryOpen && (
                    <div className="countryMenu">
                      {COUNTRY_DIAL_CODES.map((country) => (
                        <button
                          key={`${country.name}-${country.code}`}
                          type="button"
                          className={`countryOption ${country.code === formData.countryCode
                            ? "countryOptionActive"
                            : ""
                            }`}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, countryCode: country.code }));
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
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData(prev => ({ ...prev, mobile: value }));
                  }}
                  className="phoneInput"
                  placeholder="Enter mobile number"
                  autoComplete="off"
                  style={{border:"none"}}
                  maxLength={15}
                />
              </div>
            </div>

            <div className="form-group mb-3">
              <label>Complete Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className=""
                placeholder="Enter complete address"
                autoComplete="off"
                maxLength={50}
              />
            </div>

            <button className="proceed-btn btn btn-warning text-white w-100 rounded-pill" onClick={handleNext}>
              Proceed
            </button>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <h5 className="fw-bold mb-3 text-left">Bank Details</h5>
            <p className="text-secondary small text-left">Private & confidential, not for circulation</p>

            <div className="form-group mb-3">
              <label>PAN Number</label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  if (/^[A-Z0-9]*$/.test(value)) {
                    setFormData((prev) => ({ ...prev, panNumber: value }));
                  }
                }}
                placeholder="ABCDE1234F"
                maxLength={10}
                autoComplete="off"
              />
            </div>

            <div className="form-group mb-3">
              <label>Aadhaar Number</label>
              <input
                type="text"
                name="aadhaarNumber"
                value={formData.aadhaarNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setFormData((prev) => ({ ...prev, aadhaarNumber: value }));
                }}
                placeholder="Enter 12-digit Aadhaar number"
                inputMode="numeric"
                maxLength={12}
                autoComplete="off"
              />
            </div>


            <div className="form-group mb-3">
              <BankSelect value={formData.bank} onChange={handleBankChange} />
            </div>

            <div className="form-group mb-3">
              <label>Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                className=""
                placeholder="Enter account number"
                autoComplete="off"
                inputMode="numeric"
                maxLength={20}
              />
            </div>

            <div className="form-group mb-4">
              <label>Confirm Account Number</label>
              <input
                type="text"
                name="confirmAccountNumber"
                value={formData.confirmAccountNumber}
                onChange={handleChange}
                className=""
                placeholder="Confirm account number"
                autoComplete="off"
                inputMode="numeric"
                maxLength={20}
              />

              {formData.confirmAccountNumber &&
                formData.confirmAccountNumber === formData.accountNumber && (
                  <span
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M21.8026 10.0005C22.2593 12.2418 21.9338 14.5719 20.8804 16.6023C19.827 18.6326 18.1095 20.2405 16.0141 21.1578C13.9187 22.0751 11.5722 22.2463 9.36586 21.6428C7.15954 21.0394 5.22676 19.6979 3.88984 17.8419C2.55293 15.9859 1.89269 13.7277 2.01923 11.4439C2.14577 9.16001 3.05144 6.98857 4.58522 5.29165C6.11899 3.59473 8.18815 2.47491 10.4476 2.11893C12.7071 1.76295 15.0203 2.19234 17.0016 3.33548"
                        stroke="#B59131"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 11L12 14L22 4"
                        stroke="#B59131"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
            </div>

            <div className="form-group mb-3">
              <button
                className="btn btn-warning  w-100 fw-bold rounded-pill"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Proceed"}
              </button>
            </div>
          </>
        )}

        {/* {step === 3 && (
          <>
            {panStatus === "idle" && panVerificationMode === "digilocker" && (
              <>
                <div className="">
                  <h5 className="fw-bold mb-3 text-left">Verify your Pan</h5>

                  <div className="form-group mb-3">
                    <div className={styles.pandCard}>
                      <img className="mx-auto" width={350} src="/sample-pan-card.png" alt="pan card" />
                      <div className={styles.panCardPlace}>
                        <p>{panCard.name}</p>
                        <p>{panCard.number}</p>
                      </div>
                    </div>
                    <div className={styles.panDetails}>
                      <div className={styles.singleDiv}>
                        <div>Your name as per PAN</div>
                        <p>{panCard.name}</p>
                      </div>
                      <div className={`${styles.singleDiv} mt-2`}>
                        <div>Permanent Account Number (PAN) entered</div>
                        <p>{panCard.number}</p>
                      </div>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <button
                      className="btn btn-warning  w-100 fw-bold text-white rounded-pill mb-3"
                      onClick={verifyPan}
                      disabled={submitting}
                    >
                      {submitting ? "Verifying..." : "Verify via Digilocker"}

                    </button>
                    <button
                      className="proceed-btn btn btn-warning text-white w-100 fw-bold rounded-pill"
                      onClick={switchToManual}
                    >
                      Verify Manually Instead
                    </button>
                  </div>
                </div>
              </>
            )}

            {panStatus === "idle" && panVerificationMode === "manual" && (
              <div className="">
                <h5 className="fw-bold mb-3 text-left">Manual PAN Verification</h5>

                <div className="form-group mb-4">
                  <label>Name as per PAN</label>
                  <input
                    type="text"
                    name="name"
                    value={manualPan.name}
                    onChange={(e) =>
                      setManualPan({ ...manualPan, name: e.target.value })
                    }
                    className=""
                    placeholder="Enter name as per PAN"
                    autoComplete="off"
                  />
                </div>

                <div className="form-group mb-4">
                  <label>PAN Number</label>
                  <input
                    type="text"
                    name="pan"
                    value={manualPan.pan}
                    onChange={(e) =>
                      setManualPan({ ...manualPan, pan: e.target.value.toUpperCase() })
                    }
                    className=""
                    placeholder="Enter PAN number"
                    autoComplete="off"
                    maxLength={10}
                  />
                </div>

                <div className="form-group mb-3">
                  <button
                    className="btn btn-warning  w-100 fw-bold text-white rounded-pill"
                    onClick={verifyPanManually}
                    disabled={submitting}
                  >
                    {submitting ? "Verifying..." : "Verify PAN"}
                  </button>
                </div>
              </div>
            )}

            {panStatus === "verifying" && <LoaderScreen card={"pan"} />}

            {panStatus === "success" && <SuccessScreen card={"pan"} />}
            {panStatus === "error" && (
              <ErrorScreen onRetry={handlePanErrorRetry} card={"pan"} />
            )}
            {panStatus === "details" && (
              <div className="">
                <h5 className="fw-bold mb-3 text-left">Your PAN Details</h5>

                <div className="form-group mb-3">
                  <div className={styles.pandCard}>
                    <img className="mx-auto" width={350} src="/sample-pan-card.png" alt="pan card" />
                    <div className={styles.panCardPlace}>
                      <p>{panCard.name}</p>
                      <p>{panCard.number}</p>
                    </div>
                  </div>
                  <div className={styles.panDetails}>
                    <div className={styles.singleDiv}>
                      <div>Your name as per PAN</div>
                      <p>{panCard.name}</p>
                    </div>
                    <div className={`${styles.singleDiv} mt-2`}>
                      <div>Permanent Account Number (PAN) </div>
                      <p>{panCard.number}</p>
                    </div>
                  </div>
                </div>
                {isPanVerified && (
                  <button className="proceed-btn btn btn-warning text-white w-100 rounded-pill mb-3"
                    onClick={restartPanVerification}>
                    Restart Pan Verification.
                  </button>
                )}
                <div className="form-group mb-3">
                  <button className="proceed-btn btn btn-warning text-white w-100 rounded-pill  mb-3" onClick={() => {
                    handleNext();
                    proceedToAadhaarVerification()
                  }}>
                    Proceed to adhar Verification.
                  </button>


                </div>
              </div>
            )}
            {panStatus === "idle" && panVerificationMode === "reverification" && (
              <div className="">
                <h5 className="fw-bold mb-3 text-left">Verify your Pan</h5>

                <div className="form-group mb-3">
                  <div className={styles.pandCard}>
                    <img className="mx-auto" width={350} src="/sample-pan-card.png" alt="pan card" />
                    <div className={styles.panCardPlace}>
                      <p>{panCard.name}</p>
                      <p>{panCard.number}</p>
                    </div>
                  </div>
                  <div className={styles.panDetails}>
                    <div className={styles.singleDiv}>
                      <div>Your name as per PAN</div>
                      <p>{panCard.name}</p>
                    </div>
                    <div className={`${styles.singleDiv} mt-2`}>
                      <div>Permanent Account Number (PAN) entered</div>
                      <p>{panCard.number}</p>
                    </div>
                  </div>
                </div>

                <div className="form-group mb-3">
                  <button
                    className="btn btn-warning w-100 fw-bold text-white rounded-pill mb-3"
                    disabled={submitting || !panReverifyUrl}
                    onClick={() => {
                      if (!panReverifyUrl) {
                        showErrorToast("DigiLocker URL not available. Please restart verification.");
                        return;
                      }
                      Cookies.set("transaction_id", transactionResult?.transaction?.id, { expires: 1 / 48 });
                      Cookies.set("showinterest", true, { expires: 1 / 48 });
                      Cookies.set("currentStep", 3, { expires: 1 / 48 });
                      Cookies.set("pan_flow", "reverification", { expires: 1 / 48 });

                      window.location.href = panReverifyUrl;
                    }}
                  >
                    Re-verify via DigiLocker
                  </button>

                  <button
                    className="proceed-btn btn btn-warning text-white w-100 fw-bold rounded-pill"
                    onClick={switchToManual}
                  >
                    Re-Verify Manually Instead
                  </button>
                </div>
              </div>
            )}
          </>
        )} */}

        {/* {step === 4 && (
          <>
            {aadhaarStatus === "idle" && aadhaarVerificationMode === "digilocker" && (
              <>
                <div className="">
                  <h5 className="fw-bold mb-3 text-left">Verify your Aadhaar</h5>

                  <div className="form-group mb-3">
                    <div className={styles.aadharCard}>
                      <img className="mx-auto" width={350} src="/aadhar-card.png" alt="pan card" />
                      <div className={styles.aadharCardPlace}>
                       
                        <p>{aadhaarHolder.maskedNumber}</p>
                      </div>
                    </div>
                    <div className={styles.panDetails}>
                      <div className={styles.singleDiv}>
                        <div>Your name as per Aadhaar</div>
                        <p>{aadhaarHolder.name}</p>
                      </div>
                      <div className={`${styles.singleDiv} mt-2`}>
                        <div>Masked Aadhaar Number</div>
                        <p>{aadhaarHolder.maskedNumber}</p>
                      </div>
                    </div>
                  </div>
                  <div className="form-group mb-3">
                    <button
                      className="btn btn-warning  w-100 fw-bold rounded-pill mb-3"
                      onClick={startAadhaarVerification}
                      disabled={submitting}
                    >
                      {submitting ? "Starting..." : "Verify Aadhaar"}

                    </button>

                    <button
                      className="btn btn-warning  w-100 fw-bold rounded-pill"
                      onClick={switchAadhaarToManual}
                    >
                      Verify Aadhaar Manually Instead
                    </button>
                  </div>
                </div>
              </>
            )}

            {aadhaarStatus === "idle" && aadhaarVerificationMode === "manual" && (
              <AadhaarNumberForm
                aadhaarNumber={aadhaarData.number}
                setAadhaarNumber={(data) => setAadhaarData({ ...aadhaarData, number: data })}
                onSubmit={sendAadhaarOtp}
              />
            )}
            {aadhaarStatus === "otp_sent" && (
              <>
                <h5 className="fw-bold mb-3">Enter OTP</h5>

                <OtpInputs
                  otpValues={otpValues}
                  setOtpValues={setOtpValues}
                />

                <button
                  className="btn btn-warning w-100 fw-bold rounded-pill mt-3"
                  onClick={verifyAadhaarOtp}
                  disabled={submitting}
                >
                  {submitting ? "Verifying..." : "Verify OTP"}
                </button>
              </>
            )}


            {aadhaarStatus === "verifying" && <LoaderScreen card={"Aadhar"} />}
            {aadhaarStatus === "success" && <SuccessScreen card={"aadhar"} />}
            {aadhaarStatus === "error" && (

              <ErrorScreen onRetry={handleAadhaarErrorRetry} card={"aadhar"} />


            )}
            {aadhaarStatus === "details" && (
              <div className="">
                <h5 className="fw-bold mb-3 text-left">Your Aadhaar Details</h5>

                <div className="">

                  <div className="form-group mb-3">
                    <div className={styles.aadharCard}>
                      <img className="mx-auto" width={350} src="/aadhar-card.png" alt="pan card" />
                      <div className={styles.aadharCardPlace}>
                       
                        <p>{aadhaarHolder.maskedNumber}</p>
                      </div>
                    </div>
                    <div className={styles.panDetails}>
                      <div className={styles.singleDiv}>
                        <div>Your name as per Aadhaar</div>
                        <p>{aadhaarHolder.name}</p>
                      </div>
                      <div className={`${styles.singleDiv} mt-2`}>
                        <div>Masked Aadhaar Number</div>
                        <p>{aadhaarHolder.maskedNumber}</p>
                      </div>
                    </div>
                  </div>
                  <div className="form-group mb-3">
                   
                  </div>
                </div>

                {isAadhaarVerified && (
                  <button
                    className="btn btn-warning  w-100 fw-bold rounded-pill mb-3"
                    onClick={restartAadharVerification}
                    disabled={submitting}
                  >
                    Restart Aadhaar Verification
                  </button>
                )}

                <div className="form-group mb-3">
                  <button
                    className="btn btn-warning  w-100 fw-bold rounded-pill"
                    onClick={handleSign}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Proceed"}
                  </button>
                </div>
              </div>
            )}
            {aadhaarStatus === "idle" &&
              aadhaarVerificationMode === "reverification" && (
                <>
                  <h5 className="fw-bold mb-3">Re-verify Aadhaar</h5>



                  <div className="form-group mb-3">
                    <div className={styles.aadharCard}>
                      <img className="mx-auto" width={350} src="/aadhar-card.png" alt="pan card" />
                      <div className={styles.aadharCardPlace}>
                       
                        <p>{aadhaarHolder.maskedNumber}</p>
                      </div>
                    </div>
                    <div className={styles.panDetails}>
                      <div className={styles.singleDiv}>
                        <div>Your name as per Aadhaar</div>
                        <p>{aadhaarHolder.name}</p>
                      </div>
                      <div className={`${styles.singleDiv} mt-2`}>
                        <div>Masked Aadhaar Number</div>
                        <p>{aadhaarHolder.maskedNumber}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-warning w-100 fw-bold rounded-pill mb-2"
                    onClick={() => {
                      if (!aadhaarReverifyUrl) {
                        showErrorToast("DigiLocker URL not available. Please restart verification.");
                        return;
                      }
                      Cookies.set("transaction_id", transactionResult?.transaction?.id, { expires: 1 / 48 });
                      Cookies.set("showinterest", true, { expires: 1 / 48 });
                      Cookies.set("currentStep", 4, { expires: 1 / 48 });


                      window.location.href = aadhaarReverifyUrl;
                    }}
                    disabled={submitting}
                  >
                    Re-verify via DigiLocker
                  </button>

                  <button
                    className="btn btn-outline-warning w-100 fw-bold rounded-pill"
                    onClick={switchAadhaarToManual}
                  >
                    Re-verify Manually
                  </button>
                </>)}
          </>
        )} */}
        {step === 3 && (
          <>
            <h5 className="fw-bold mb-3 text-left">Review Share Application form</h5>
            <div className="pdf-container">
              {/* <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(
                  `${process.env.NEXT_PUBLIC_USER_BASE}/investor${pdfUrl}`
                )}&embedded=true`}
                className="pdf-iframe"
              /> */}
              <iframe
                src={`${process.env.NEXT_PUBLIC_USER_BASE}/investor${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                className="pdf-iframe"
              />
            </div>
            <button className="proceed-btn btn btn-warning text-white w-100 rounded-pill" onClick={handleNext}>
              Proceed
            </button>
          </>
        )}




        {step === 4 && (
          <>
            <div className="close_btn">
              <button className="close_poup" onClick={() => {
                handleClose();

              }} aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <g clipPath="url(#clip0_10705_27892)">
                    <path d="M0.781396 16.0001C0.626858 16.0001 0.475783 15.9543 0.347281 15.8685C0.218778 15.7826 0.118621 15.6606 0.0594776 15.5178C0.000334661 15.3751 -0.0151369 15.218 0.0150198 15.0664C0.0451766 14.9148 0.119607 14.7756 0.228896 14.6664L14.6664 0.228853C14.8129 0.0823209 15.0117 0 15.2189 0C15.4261 0 15.6249 0.0823209 15.7714 0.228853C15.9179 0.375385 16.0002 0.574125 16.0002 0.781353C16.0002 0.988581 15.9179 1.18732 15.7714 1.33385L1.3339 15.7714C1.26141 15.844 1.17528 15.9016 1.08047 15.9408C0.985653 15.9801 0.884016 16.0002 0.781396 16.0001Z" fill={isunlisted ? "#1F2937" : "white"} />
                    <path d="M15.2189 16.0001C15.1162 16.0002 15.0146 15.9801 14.9198 15.9408C14.825 15.9016 14.7388 15.844 14.6664 15.7714L0.228853 1.33385C0.0823209 1.18732 0 0.988581 0 0.781353C0 0.574125 0.0823209 0.375385 0.228853 0.228853C0.375385 0.0823209 0.574125 0 0.781353 0C0.988581 0 1.18732 0.0823209 1.33385 0.228853L15.7714 14.6664C15.8806 14.7756 15.9551 14.9148 15.9852 15.0664C16.0154 15.218 15.9999 15.3751 15.9408 15.5178C15.8816 15.6606 15.7815 15.7826 15.653 15.8685C15.5245 15.9543 15.3734 16.0001 15.2189 16.0001Z" fill={isunlisted ? "#1F2937" : "white"} />
                  </g>
                  <defs>
                    <clipPath id="clip0_10705_27892">
                      <rect width="16" height="16" fill={isunlisted ? "#1F2937" : "white"} />
                    </clipPath>
                  </defs>
                </svg>
              </button>
            </div>

            <div className="third_step">
              <div className="success-image">
                <Image src="/success-interest.svg" alt="Success Icon" width={263} height={263} />
              </div>

              <h3 className="t_success">Success!</h3>
              <p className="t_subccess">Your Application Has Been Submitted</p>
              <p className="t_botomsubccess">Thank you for confirming your interest and successfully e-signing the Share Application Form.</p>

              <div className="bottom_successm">
                <div className="svgIcon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M10 2V4" stroke="#B18C07" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 2V4" stroke="#B18C07" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 8C16.2652 8 16.5196 8.10536 16.7071 8.29289C16.8946 8.48043 17 8.73478 17 9V17C17 18.0609 16.5786 19.0783 15.8284 19.8284C15.0783 20.5786 14.0609 21 13 21H7C5.93913 21 4.92172 20.5786 4.17157 19.8284C3.42143 19.0783 3 18.0609 3 17V9C3 8.73478 3.10536 8.48043 3.29289 8.29289C3.48043 8.10536 3.73478 8 4 8H18C19.0609 8 20.0783 8.42143 20.8284 9.17157C21.5786 9.92172 22 10.9391 22 12C22 13.0609 21.5786 14.0783 20.8284 14.8284C20.0783 15.5786 19.0609 16 18 16H17" stroke="#B18C07" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 2V4" stroke="#B18C07" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p>
                  Your investment application is now under review. We'll verify the details and Our team will
                  get in touch with you to take the process forward
                </p>
              </div>

              <button className="btn btn-warning w-100 fw-bold rounded-pill mt-3" onClick={() => {
                handleClose();

              }}>
                Explore More
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ShowInterestModal;