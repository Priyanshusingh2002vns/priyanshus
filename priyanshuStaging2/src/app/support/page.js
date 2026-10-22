"use client";
import { useState } from "react";
import styles from "./page.module.css";
import Cookies from "js-cookie";
import { showErrorToast, showSuccessToast } from "@/app/components/ToastProvider";

export default function Page() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showErrorToast("Please enter your name");
      return;
    }
    if (!/^[A-Za-z\s]+$/.test(name.trim())) {
      showErrorToast("Name can only contain letters");
      return;
    }
    if (!email.trim()) {
      showErrorToast("Please enter your email");
      return;
    }
    if (!subject.trim()) {
      showErrorToast("Please enter a subject");
      return;
    }
    if (!msg.trim()) {
      showErrorToast("Please enter your message");
      return;
    }
    if (msg.trim().length < 100) {
      showErrorToast("Message must be at least 100 characters");
      return;
    }

    const accessToken = Cookies.get("accessToken");

    if (!accessToken) {
      showErrorToast("Access token not found. Please log in again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/support/raise-support`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: name,
            email: email,
            support_title: subject,
            support_message: msg,
          }),
        }
      );

      const result = await response.json();
      console.log("result is:", result);

      if (result?.status_code === 201) {
        showSuccessToast(result?.message || "Support request submitted successfully!");
        setName("");
        setEmail("");
        setSubject("");
        setMsg("");
      } else {
        showErrorToast("Failed to submit support request.");
      }
    } catch (error) {
      showErrorToast("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Support</h1>
      <p className={styles.subtitle}>
        Fill out the form below and we'll get back to you as soon as possible.
      </p>
      <div className={styles.hr}></div>

      <div className={styles.formContainer}>
        <form className={styles.form} onSubmit={handleSubmit}>

          {/* Name Field */}
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              <span className={styles.labeltext}>Name</span>
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter your name"
              className={styles.input}
              value={name}
              onChange={(e) => {
                const val = e.target.value;
                if (/^[A-Za-z\s]*$/.test(val)) {
                  setName(val);
                }
              }}
            />
          </div>

          {/* Email Field */}
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              <span className={styles.labeltext}>Email</span>
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Subject Field */}
          <div className={styles.field}>
            <label htmlFor="subject" className={styles.label}>
              <span className={styles.labeltext}>Subject</span>
            </label>
            <input
              type="text"
              id="subject"
              placeholder="Enter your subject"
              className={styles.input}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Message Field */}
          <div className={styles.field}>
            <label htmlFor="message" className={styles.label}>
              <span className={styles.labeltext}>Message</span>
            </label>
            <textarea
              id="message"
              placeholder="Please describe your issue in detail (at least 100 characters)"
              className={styles.textarea}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            ></textarea>
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
