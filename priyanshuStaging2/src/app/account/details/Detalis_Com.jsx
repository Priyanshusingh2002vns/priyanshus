"use client";
import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import ChangePhone from "../modal-change-phone/ChangePhone";
import ChangeEmail from "../modal-change-email/ChangeEmail";
import EditDetails from "../editDetails/EditDetails";
import Otp from "../modal-otp-verification/Otp";
import { useUserContext } from "@/app/context/UserContext";


export default function Details_Com() {
  const [shortName, setShortName] = useState("");
  const [id, setId] = useState("");

  const { investor, setInvestor, loading, refreshInvestor } = useUserContext()
  const [newEmail, setNewEmail] = useState();
  // console.log("newemail", newEmail);

  const [showphoneModal, setShowPhoneModal] = useState(false);
  const [showemailModal, setShowEmailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  useEffect(() => {
    if (showemailModal || showphoneModal || showEditModal || showOtp) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [showemailModal, showphoneModal, showEditModal, showOtp]);

  // useEffect(() => {
  // const investorStr = Cookies.get("investor");
  //   async function fetchInvestor(){

  //   }name
  //   if (investorStr) {
  //     try {
  //       const parsedInvestor = JSON.parse(investorStr);
  //       setInvestor(parsedInvestor);

  //       if (parsedInvestor.name) {
  //         // 🔹 generate initials
  //         const initials = parsedInvestor.name
  //           .trim()
  //           .split(/\s+/) // split by spaces
  //           .map((n) => n[0].toUpperCase())
  //           .join("");
  //         setShortName(initials);

  //         // 🔹 generate last 6 chars of id
  //         const lastSix = parsedInvestor.id
  //           ? parsedInvestor.id.toString().slice(-6).toUpperCase()
  //           : "";
  //         setId(lastSix);
  //       }
  //     } catch (error) {
  //       console.error("Invalid investor cookie:", error);
  //     }
  //   }
  // }, []);
  useEffect(() => {
      if (investor?.full_name) {
        const initials = investor.full_name
          .trim()
          .split(/\s+/)
          .map((n) => n[0]?.toUpperCase())
          .join("");
        setShortName(initials);
      }

        const lastsix = investor?.id
          ? investor.id
          : "";
        setId(lastsix);

        // localStorage.setItem("investorDetails", JSON.stringify(investor?.id));

        // if (data.success) {
        //   setInvestor(data.data);
        // } else {
        //   console.error("Error:", data.message);
        // }
  }, [investor]);

  useEffect(() => {
    refreshInvestor?.();
  }, [refreshInvestor]);

useEffect(() => {
  console.log("short name updated:", shortName);
}, [investor]);

  return (
    <div className={styles.main_container}>
      <div className={styles.header}>
        <h1 className={styles.h1}>Account Details</h1>
        <div
          className={styles.edit_icon}
          onClick={() => setShowEditModal(!showEditModal)}
        >
          {" "}
          <img src="/account_images/edit_icon.svg"  width={14} height={14} />
        </div>
      </div>
      <div>
        {" "}
        {showEditModal && (
          <div className={styles.edit_details_container}>
            <EditDetails
              fullName={investor?.full_name}
              investorType={investor?.investor_type}
              organization={investor?.organization}
              location={investor?.location}
              isOpen={setShowEditModal}
              email = {investor?.email}
              phoneNumber = {investor?.phone_number}
              userId={investor?.id}
              onClose={() => setShowEditModal(false)}
            />
          </div>
        )}
      </div>

      <div className={styles.responsive_user_details}>
        <div className={styles.avatar}>{shortName}</div> 
        <div className={styles.avatardetails}>
          <div className={styles.id}>
  {id ? String(id).slice(-6).toUpperCase() : ""}
</div>
          <div className={styles.name}>
             {investor?.full_name
              ? investor.full_name.charAt(0).toUpperCase() +
                investor.full_name.slice(1)
              : ""}
          </div>
        </div>
      </div>

      <div className={styles.hr_header}></div>

      <section className={styles.details_section}>
        <div className={styles.name}>
          <div className={styles.heading}>Name</div>
          <div className={styles.value}>
            {investor?.full_name
              ? investor.full_name.charAt(0).toUpperCase() +
                investor.full_name.slice(1)
              : ""}
          </div>
        </div>
        <div className={styles.hr}></div>

        <div className={styles.email}>
          <div className={styles.heading}>Email</div>
          <div className={styles.emailChange}>
            <div className={styles.value}>{investor?.email}</div>
            <a
              className={styles.Link}
              href="#"
              onClick={() => setShowEmailModal(true)}
            >
              Change
            </a>
            <ChangeEmail
              setShowOtp={setShowOtp}
              isOpen={showemailModal}
              onClose={() => setShowEmailModal(false)}
              newEmail={setNewEmail}
            />
          </div>
        </div>

        <div className={styles.hr}></div>

        <div className={styles.mobile}>
          <div className={styles.heading}>Mobile Number</div>
          <div className={styles.mobileChange}>
            <div className={styles.value}>
              {investor?.phone_number || "N/A"}
            </div>
            <div>
              <a
                className={styles.Link}
                href="#"
                onClick={() => setShowPhoneModal(true)}
              >
                Change
              </a>
              <ChangePhone
                isOpen={showphoneModal}
                onClose={() => setShowPhoneModal(false)}
              />
            </div>
          </div>
        </div>

        <div className={styles.hr}></div>

        <div className={styles.inverstor}>
          <div className={styles.heading}>Investor Type</div>
          <div className={styles.otp}>
            <div className={styles.value}>
              {investor?.investor_type || "N/A"}
            </div>
            {showOtp && (
              <Otp
                showOtp={showOtp}
                newEmail={newEmail}
                setShowOtp={setShowOtp}
                userId={id}
              />
            )}
          </div>
        </div>
        <div className={styles.hr}></div>

        <div className={styles.organization}>
          <div className={styles.heading}>Organization</div>
          <div className={styles.value}>{investor?.organization || "N/A"}</div>
        </div>
        <div className={styles.hr}></div>

        <div className={styles.location}>
          <div className={styles.heading}>Location</div>
          <div className={styles.value}>{investor?.location || "N/A"}</div>
        </div>
      </section>
    </div>
  );
}
