"use client";

import React, { useEffect, useState } from "react";
import styles from "./notification.module.css"
import { BadgePlus, FileUp, Headset, ThumbsUp, X } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";


const NotificationPopup = ({ isOpen, onClose, allNotifications = [], fetchNotifications }) => {

    const router = useRouter();

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

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener("keydown", handleEsc);
        }

        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;



    function timeAgo(dateString) {
        const now = new Date();
        const past = new Date(dateString);
        const diff = now - past;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);  // Approximate
        const years = Math.floor(days / 365); // Approximate

        if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
        if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
        if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    }

    const markNotificationAsRead = async (notificationId) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/notifications/investor/mark-as-read`,
                {
                    method: "PATCH",
                    headers: {
                        'Authorization': `Bearer ${Cookies.get('accessToken')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        notificationIds: [notificationId],
                    }),
                }
            );
            if (!response.ok) {
                throw new Error(`Failed: ${response.status}`);
            }
            const result = await response.json();
            await fetchNotifications();
            return result;
        } catch (error) {
            console.error("Error marking notification as read:", error);
            return null;
        }
    };

  const handleNotificationClick = (data) => {
    // 1. ROUTE FIRST (Immediate UI update)
    if (data.notification_type === "deal" && data.deal_slug) {
        const dealType = data.deal_type ? data.deal_type.toLowerCase() : "";
        if (dealType === "public" || dealType === "unlisted") {
            router.push(`/deals/${data.deal_slug}`);
        } else {
            const ua = navigator.userAgent.toLowerCase();
            const isIOS = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
            const isMac = /macintosh|mac os x/.test(ua);

            if (isIOS || isMac) {
                window.open("https://apps.apple.com/in/app/preqt/id6751903472", "_blank");
            } else {
                window.open("https://play.google.com/store/apps/details?id=com.preqt.app", "_blank");
            }
        }
    } 
    else if (data.notification_type === "post" && data.post_slug) {
        router.push(`/community/${data.post_slug}`);
    }

    // 2. MARK AS READ (Run in background, NON-blocking)
    setTimeout(() => {
        markNotificationAsRead(data.id);
    }, 100); // small delay so it doesn't block routing

    // Optional: close notification popup instantly
    onClose?.();
};



    function isWithinOneHour(isoTime) {
        const givenTime = new Date(isoTime);
        const currentTime = new Date();
        const diffInMs = currentTime - givenTime;
        const diffInHours = diffInMs / (1000 * 60 * 60);
        return diffInHours <= 1 && diffInHours >= 0; // true if within past 1 hour
    }

    const recent = allNotifications.filter(
        (n) => !n.is_read && isWithinOneHour(n.createdAt)
    );

    const unread = allNotifications.filter(
        (n) => !n.is_read && !isWithinOneHour(n.createdAt)
    );



    return (

        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>Notifications</h3>
                    <div onClick={() => { onClose() }} style={{ cursor: 'pointer' }}>
                        <X />
                    </div>
                </div>
                <div className={styles.mobHeader}>
                    <svg
                        onClick={() => { onClose() }}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M12 19L5 12L12 5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M19 12H5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <h3>Notifications</h3>
                    <div></div>
                </div>

                {allNotifications.some(data => !data.is_read && isWithinOneHour(data.createdAt)) && (
                    <div className={styles.section}>
                        <div className={styles.UnreadTitle}>
                            <h3>Recent</h3>
                        </div>
                        {allNotifications.map((data, i) => (
                            !data.is_read && isWithinOneHour(data.createdAt) && (
                                <div
                                    key={data.id}
                                    className={styles.notificationCard}
                                    onClick={() => handleNotificationClick(data)}
                                >
                                    <div className={styles.icon}>
                                        {data.notification_type === "NEW_DEAL" ? (
                                            <BadgePlus size={18} strokeWidth={3} />
                                        ) : (
                                            <ThumbsUp size={18} strokeWidth={3} />
                                        )}
                                    </div>
                                    <div className={styles.content}>
                                        <p className={styles.title}>{data.notification_title}</p>
                                        {data.notification_message && (
                                            <p className={styles.desc}>{data.notification_message}</p>
                                        )}
                                        <span className={styles.time}>{timeAgo(data.createdAt)}</span>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}

                <div className={styles.section}>

                    {/* IF UNREAD EXISTS -> SHOW UNREAD TITLE */}
                    {unread.length > 0 && (
                        <div className={styles.UnreadTitle}>
                            <h3>Unread</h3>
                        </div>
                    )}

                    {/* IF NO UNREAD -> SHOW NO NOTIFICATIONS UI */}
                    {unread.length === 0 && recent.length === 0 ? (
                        <div className={styles.sectionTitle}>
                            <img src="/NotificationObject.png" alt="NotificationImg" className={styles.noNotificationIng} />
                            <div className={styles.noNotificationText}>
                                <h2>No Notifications Yet</h2>
                                <p>You have no notification right now.</p>
                            </div>
                            <button
                                className={styles.showBtn}
                                // onClick={() => {
                                //     setShowSlider(false);
                                //     if (lots <= maxLots) {
                                //         setShowInterestModal(true);
                                //     } else {
                                //         showErrorToast(`You can invest up to ₹${limit.toLocaleString("en-IN")} only.`);
                                //     }
                                // }}
                                style={{ border: "unset" }}
                            >
                                Return to home page
                            </button>

                        </div>
                    ) : (
                        unread.map((data) => (
                            <div
                                key={data.id}
                                className={styles.notificationCard}
                                onClick={() => handleNotificationClick(data)}
                            >
                                <div className={styles.icon}>
                                    {data.notification_type === "NEW_DEAL"
                                        ? <BadgePlus size={18} strokeWidth={3} />
                                        : <ThumbsUp size={18} strokeWidth={3} />}
                                </div>

                                <div className={styles.content}>
                                    <p className={styles.title}>{data.notification_title}</p>
                                    {data.notification_message && (
                                        <p className={styles.desc}>{data.notification_message}</p>
                                    )}
                                    <span className={styles.time}>{timeAgo(data.createdAt)}</span>
                                </div>
                            </div>
                        ))
                    )}

                </div>

            </div>
            <div></div>
        </div>
    );
};

export default NotificationPopup;
