"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { showErrorToast, showSuccessToast } from "@/app/components/ToastProvider";
import Cookies from "js-cookie";

export default function NotificationPreference() {
  const [preferences, setPreferences] = useState({
    sms: false,
    whatsapp: false,
    email: false,
  });
  const [loading, setLoading] = useState(false);

  // ✅ Fetch user’s current preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        const accessToken = Cookies.get("accessToken");
        if (!accessToken) {
          console.log("No access token found");
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/investor/enabled-notifications-channel`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await res.json();
        if (data?.status_code === 200 && data?.data) {
          setPreferences({
            sms: data.data.for_push || false,
            whatsapp: data.data.for_whatsapp || false,
            email: data.data.for_email || false,
          });
        } else {
          showErrorToast(data?.message || "Failed to fetch preferences");
        }
      } catch (error) {
        showErrorToast("Error fetching preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  // ✅ Toggle and update preferences
  const togglePreference = async (type) => {
    const previousPrefs = { ...preferences };
    const updatedPrefs = { ...preferences, [type]: !preferences[type] };
  
    try {
      setLoading(true);
  
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        console.log("No access token found");
        return;
      }
  
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/investor/enable-notifications-channel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            for_whatsapp: updatedPrefs.whatsapp,
            for_push: updatedPrefs.sms,
            for_email: updatedPrefs.email,
          }),
        }
      );
  
      const data = await res.json();
  
      if (data?.status_code === 200) {
        setPreferences(updatedPrefs); // ✅ apply toggle only after success
        showSuccessToast(data?.message || "Notification preferences updated successfully");
      } else {
        showErrorToast(data?.message || "Failed to update preferences");
        setPreferences(previousPrefs); // ❌ revert toggle on failure
      }
    } catch (error) {
      showErrorToast("Error updating preferences");
      setPreferences(previousPrefs); // ❌ revert toggle on error
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Notification Preference</h2>
      <div className={styles.divider}></div>

      <div className={styles.item}>
        <span>Allow SMS notifications</span>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={preferences.sms}
            onChange={() => togglePreference("sms")}
            disabled={loading}
          />
          <span className={styles.slider}></span>
        </label>
      </div>

      <div className={styles.item}>
        <span>Allow WhatsApp messages</span>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={preferences.whatsapp}
            onChange={() => togglePreference("whatsapp")}
            disabled={loading}
          />
          <span className={styles.slider}></span>
        </label>
      </div>

      <div className={styles.item}>
        <span>Allow Email messages</span>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={preferences.email}
            onChange={() => togglePreference("email")}
            disabled={loading}
          />
          <span className={styles.slider}></span>
        </label>
      </div>
    </div>
  );
}
