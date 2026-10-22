"use client";

import { useDealStore } from "@/store/dealStore";
import Cookies from "js-cookie";
import styles from "./Calculator.module.css";
import { showErrorToast, showSuccessToast } from "@/app/components/ToastProvider";
import { useState } from "react";
import { FcOk } from "react-icons/fc";


function getClosestUpcomingDate(meetings) {
  if (!Array.isArray(meetings)) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingMeetings = meetings
    .filter(m => {
      const d = new Date(m.meeting_date);
      return d >= today;
    })
    .sort(
      (a, b) =>
        new Date(a.meeting_date) - new Date(b.meeting_date)
    );

  // IMPORTANT: return the original backend string
  return upcomingMeetings.length
    ? upcomingMeetings[0].meeting_date
    : null;
}



export default function GetInvite({fetchDealDetails}) {
  const dealDetails = useDealStore((state) => state.dealDetails);
  const [isLoading, setIsLoading] = useState(false);



  const managementMeeting = getClosestUpcomingDate(dealDetails?.data?.deal_setpData?.management_meeting_date || []);
  const meetingDate = dealDetails?.data?.deal_setpData?.management_meeting_date[0]?.meeting_date
const isVerified =
  dealDetails?.data?.deal_setpData?.management_meeting_date?.[0]?.is_invited === true;


 const getInvite = async () => {
  try {
    setIsLoading(true);

    const dealData = dealDetails?.data?.deal_id;
    const accessToken = Cookies.get("accessToken");

    if (!dealData || !accessToken) return;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/dashboard/deal-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          deal_id: dealData,
          request_date: managementMeeting,
        }),
      }
    );

    const result = await response.json();

    if (result.success === true) {
      showSuccessToast(result?.message || "Invite sent successfully");

      // 🔑 Backend truth refresh
      await fetchDealDetails();
    } else {
      showErrorToast(result?.message || "Failed to get invite");
    }
  } catch {
    showErrorToast("Failed to get invite");
  } finally {
    setIsLoading(false);
  }
};



  if (!managementMeeting) {
    return null;
  }

  // if(isInviteSent === true){
  //   return null;
  // }

  const formatMeetingDate = (dateString) => {
    if (!dateString) return "";

    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className={styles.getInviteWrapper}>
      <div className={styles.greenDot}></div>

      <div className={styles.getInvite}>
        <div className={styles.getInviteLeft}>
          <span>Management Meeting</span>
          <small className={styles.meetingDate}>Date . {formatMeetingDate(meetingDate)}</small>
        </div>

<button
  onClick={getInvite}
  disabled={isLoading || isVerified}
  className={styles.inviteButton}
>
  {isLoading ? (
    <span className={styles.loader}></span>
  ) : isVerified ? (
    <span className={styles.verified}>
      <FcOk size={32} />

      <span className={styles.verifiedUnderline}></span>
    </span>
  ) : (
    "Get Invite"
  )}
</button>
      </div>
    </div>
  );
}
