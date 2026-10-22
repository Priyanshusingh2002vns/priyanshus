"use client";

import { useMeetingContext } from "@/app/context/MeetingContext";
import styles from "./page.module.css";
import { useState } from "react";

const formatMeetingDate = (isoDate) => {
  const date = new Date(isoDate);

  return date.toLocaleString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
};

const getMeetingStatus = (meetingDate) => {
  return new Date(meetingDate) > new Date()
    ? "Meeting scheduled"
    : "Meeting completed";
};


export default function ManagementMeeting() {
  const { getMeeting, status, setStatus } = useMeetingContext();
  const [isOpen, setIsOpen] = useState(false);


  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2>Meeting</h2>

       <div className={styles.customSelect}>
  <button
    type="button"
    className={styles.selectTrigger}
    onClick={() => setIsOpen((prev) => !prev)}
  >
    <span className={styles.selectedText}>
      {status === "upcoming" ? "Upcoming" : "Default"}
    </span>
    <span className={styles.chevron}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M4 6L8 10L12 6" stroke="#1E293B" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
    </span>
  </button>

  {isOpen && (
    <ul className={styles.dropdown}>
      <li
        className={status === "upcoming" ? styles.active : ""}
        onClick={() => {
          setStatus("upcoming");
          setIsOpen(false);
        }}
      >
        Upcoming
      </li>
      <li
        className={status === "default" ? styles.active : ""}
        onClick={() => {
          setStatus("default");
          setIsOpen(false);
        }}
      >
        Default
      </li>
    </ul>
  )}
</div>

      </div>

      {/* Cards */}
      <div className={styles.list}>
        {getMeeting.map((item) => {
          const logo =
            item.company_logo?.[0]?.thumbnail?.[0]?.path ||
            item.company_logo?.[0]?.path ||
            "";

          return (
            <div key={item.deal_id} className={styles.card}>
              <div className={styles.topRow}>
                <div className={styles.company}>
                  <div className={styles.logo}>
                    <img
                      src={
                        logo
                          ? `${process.env.NEXT_PUBLIC_USER_BASE}${logo}`
                          : "/logo-fallback.png"
                      }
                      alt={item.company_name}
                      onError={(e) => {
                        e.currentTarget.onerror = null; // prevent infinite loop
                        e.currentTarget.src = "/logo-fallback.png";
                      }}
                    />
                  </div>


                  <div>
                    <p className={styles.companyName}>
                      {item.company_name}
                    </p>
                    <p className={styles.meta}>
                      {item.tags?.length > 0 ? (
                        item.tags.map((tag, index) => (
                          <span key={index}>
                            {tag}
                            {index < item.tags.length - 1 && " |  "}
                          </span>
                        ))
                      ) : (
                        "—"
                      )}
                    </p>

                  </div>
                </div>

                <div className={styles.rightMeta}>
                  <span className={styles.time}>
                    {new Date(item.created_at).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className={styles.status}>
                    {getMeetingStatus(item.meeting_datetime)}
                  </span>
                </div>
              </div>

              <div className={styles.details}>
                <p className={styles.title}>
                  Invitation: Meeting with the management
                </p>
                <p className={styles.date}>
                  {formatMeetingDate(item.meeting_datetime)}
                </p>
              </div>

              <a
                href={item.meeting_link}
                target="_blank"
                className={styles.linkBox}
                rel="noreferrer"
              >
                {item.meeting_link}
                <span className={styles.arrow}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M7 7H17V17" stroke="#C9A74E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 17L17 7" stroke="#C9A74E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
