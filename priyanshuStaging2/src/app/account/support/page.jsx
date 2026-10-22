"use client";
import { useState } from "react";
import styles from "./page.module.css";
import Cookies from "js-cookie";
import { showErrorToast, showSuccessToast } from "@/app/components/ToastProvider";

export default function Page() {
  const [name, setName] = useState("");
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
    if (!subject.trim()) {
      showErrorToast("Please enter a subject");
      return;
    }
    if (!msg.trim()) {
      showErrorToast("Please enter your message");
      return;
    }
    if (msg.trim().length < 100) {
      showErrorToast("Message must be at least 100 characters long");
      return;
    }

    const accessToken = Cookies.get("accessToken");

    if (!accessToken) {
      showErrorToast("Access token not found. Please log in again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_USER_BASE}investor/api/support/raise-support`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          support_title: subject.trim(),
          support_message: msg.trim()
        }),
      });
      const result = await response.json();
      if (result?.status_code === 201) {
        showSuccessToast(result?.message || "Support request submitted successfully!");
        setName("");
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
      <h2 className={styles.title}>Support</h2>
      <p className={styles.subtitle}>
        Fill out the form below and we'll get back to you as soon as possible.
      </p>
      <div className={styles.hr}></div>

      <div className={styles.formContainer}>
        <form className={styles.form} onSubmit={handleSubmit}>
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
