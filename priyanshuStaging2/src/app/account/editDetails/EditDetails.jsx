"use client";
import ChangePhone from "../modal-change-phone/ChangePhone";
import ChangeEmail from "../modal-change-email/ChangeEmail";
import styles from "./page.module.css";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { showErrorToast, showSuccessToast } from "@/app/components/ToastProvider";
import Otp from "../modal-otp-verification/Otp";

export default function EditDetails({
  isOpen,
  onClose,
  fullName,
  email,
  phoneNumber,
  investorType,
  organization,
  location,
  userId // Received from parent
  // setShowOtp
}) {
  const [showphoneModal, setShowPhoneModal] = useState(false);
  const [showemailModal, setShowEmailModal] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  console.log("phoneNumber", phoneNumber);
  console.log("email", email);
  console.log("fullName", fullName);
  console.log("investorType", investorType);
  console.log("organization", organization);
  console.log("location", location);

  // ... (rest of the code)

  // In render method, update ChangeEmail and add Otp



  const getFirstAndLastName = (name) => {
    if (!name) return { firstName: "", lastName: "" };
    const parts = name.trim().split(" ").filter(Boolean);
    const firstName = parts[0] || "";
    const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";
    return { firstName, lastName };
  };

  const { firstName, lastName } = getFirstAndLastName(fullName);

  const [form, setForm] = useState({
    firstName: firstName ?? "",
    lastName: lastName ?? "",
    investorType: investorType ?? "",
    organization: organization ?? "",
    location: location ?? "",
    phoneNumber: phoneNumber ?? "",
  });

  useEffect(() => {
    setForm({
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      investorType: investorType ?? "",
      organization: organization ?? "",
      location: location ?? "",
      phoneNumber: phoneNumber ?? "",
    });
  }, [firstName, lastName, investorType, organization, location, phoneNumber]);


  const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };



  // add/remove a class on body when modal is open to prevent background scroll
  // useEffect(() => {
  //   if (typeof window === "undefined") return;
  //   const bodyClass = "modal-open";

  //   if (isOpen) {
  //     document.body.classList.add(bodyClass);
  //     // also prevent scrolling
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.classList.remove(bodyClass);
  //     document.body.style.overflow = "";
  //   }

  //   // cleanup in case component unmounts while modal is open
  //   return () => {
  //     document.body.classList.remove(bodyClass);
  //     document.body.style.overflow = "";
  //   };
  // }, [isOpen]);


  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  const modalRef = React.useRef(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
        modalRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSumbit = async (e) => {
    e.preventDefault();

    try {
     const payload = {
      full_name: `${form.firstName} ${form.lastName}`,
      investor_type: form.investorType,
      organization: form.organization,
      location: form.location,
    };

      const accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        console.log("No access token found");
        return;
      }
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/investor/edit-Investor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        // console.log("Details Edited");
        onClose();
        window.location.reload();
      }
    } catch (err) {
      showErrorToast("Error updating details:", err);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.headar}>
          <h3 className={styles.title}>Edit Account Detail</h3>

          <button className={styles.closeBtn} onClick={onClose}>
            <img src="/otp modal/cross-close.svg" alt="close" />
          </button>
        </div>
        <div className={styles.line}></div>
        {/* First Name */}
        <div className={styles.main}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>First Name</label>
            <input
              type="text"
              name="firstName"
              placeholder="Enter your first name"
              value={form.firstName}
              onChange={handleChange}
            />
          </div>

          {/* Last Name */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Last Name</label>
            <input
              type="text"
              name="lastName"
              placeholder="Enter your last name"
              value={form.lastName}
              onChange={handleChange}
            />
          </div>

          <div className={styles.form_details}>
            {" "}
            <div className={styles.email}>
              <div className={styles.heading}>Email</div>
              <div className={styles.emailChange}>
                <div className={styles.value}>{email}</div>
                <a
                  className={styles.Link}
                  onClick={() => setShowEmailModal(true)}
                >
                  Change{" "}
                </a>
                <ChangeEmail
                  isOpen={showemailModal}
                  onClose={() => setShowEmailModal(false)}
                  setShowOtp={setShowOtp}
                  newEmail={setNewEmail}
                />
                 {showOtp && (
                  <Otp
                    showOtp={showOtp}
                    setShowOtp={setShowOtp}
                    newEmail={newEmail}
                    userId={userId}
                    onClose={() => setShowOtp(false)}
                  />
                )}
              </div>
            </div>
            <div className={styles.hr}></div>
            <div className={styles.mobile}>
              <div className={styles.heading}>Mobile Number</div>
              <div className={styles.mobileChange}>
                <div className={styles.value}>{phoneNumber || "N/A"}</div>
                <a
                  className={styles.Link}
                  onClick={() => setShowPhoneModal(true)}
                >
                  Change{" "}
                </a>
                <ChangePhone
                  isOpen={showphoneModal}
                  onClose={() => setShowPhoneModal(false)}
                  userId={userId}
                />
              </div>
            </div>
          </div>

          <div className={styles.hr}></div>

          {/* Investor Type */}
          <div className={`${styles.inputGroup} ${styles.investorTypeGroup}`}>
            <label>Investor Type</label>
            <div className={styles.radioGroup}>
              <label>
                <input
                  className={styles.radioBtn}
                  type="radio"
                  style={{ accentColor: " rgba(177, 140, 7, 1)" }}
                  name="investorType"
                  value="Retail Investor"
                  checked={form.investorType === "Retail Investor"}
                  onChange={handleChange}
                />
                Retail Investor
              </label>
              <label>
                <input
                  className={styles.radioBtn}
                  type="radio"
                  style={{ accentColor: " rgba(177, 140, 7, 1)" }}
                  name="investorType"
                  value="UHNI"
                  checked={form.investorType === "UHNI"}
                  onChange={handleChange}
                />
                UHNI | Ultra High Net Worth Individuals
              </label>
              <label>
                <input
                  className={styles.radioBtn}
                  type="radio"
                  style={{ accentColor: " rgba(177, 140, 7, 1)" }}
                  name="investorType"
                  value="Family Office"
                  checked={form.investorType === "Family Office"}
                  onChange={handleChange}
                />
                Family Office
              </label>
            </div>
          </div>

          {/* <div className={styles.inputGroup}>
            <label className={styles.label}>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Enter 10 digit phone number"
              value={form.phoneNumber}
              onChange={handleChange}
              maxLength={10}
            />
          </div> */}


          {/* Organization */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Organization</label>
            <input
              type="text"
              name="organization"
              placeholder="Enter your organisation name"
              value={form.organization}
              onChange={handleChange}
            />
          </div>

          {/* Location */}
          <div className={styles.inputGroup}>
            <label id="location" className={styles.label}>
              Location
            </label>

            <input
              type="text"
              id="location"
              name="location"
              placeholder="Enter your location"
              value={form.location}
              onChange={handleChange}
            />
          </div>


          {/* Save Button */}
          <div className={styles.buttonWrapper}>
            <button onClick={handleSumbit} className={styles.saveBtn}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
