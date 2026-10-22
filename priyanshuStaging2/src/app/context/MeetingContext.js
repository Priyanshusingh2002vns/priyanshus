"use client";

import Cookies from "js-cookie";
import { createContext, useContext, useEffect, useState } from "react";

const MeetingContext = createContext(null);

export const MeetingProvider = ({ children }) => {
  const [getMeeting, setGetMeeting] = useState([]);
  const [showMeetingPage, setShowMeetingPage] = useState(false);
  const [status, setStatus] = useState("default"); // ✅ default

  useEffect(() => {
    const getInvestorMeetingData = async () => {
      try {
        const token = Cookies.get("accessToken");
        if (!token) return;

        const API_URL = `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/dashboard/investor-meeting-data?status=${status}`;

        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("API failed");
        }

        const result = await response.json();
        const meetings = result?.data || [];

        setGetMeeting(meetings);
        setShowMeetingPage(meetings.length > 0);
      } catch (error) {
        console.error("Error fetching meeting data:", error);
        setShowMeetingPage(false);
      }
    };

    getInvestorMeetingData();
  }, [status]);

  return (
    <MeetingContext.Provider
      value={{
        getMeeting,
        showMeetingPage,
        status,
        setStatus,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeetingContext = () => useContext(MeetingContext);
