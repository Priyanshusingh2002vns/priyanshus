
"use client";
import React, { useEffect, useState } from "react";
import styles from "./Transaction_Component.module.css";
import Image from "next/image";
import Cookies from "js-cookie";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Loader from "@/app/components/Loader";


export default function TransactionComponent() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const router = useRouter();
  const [transactionDetails, setTransactionDetails] = useState(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Get transaction ID from URL
  const selectedTransactionId = searchParams.get('id');

  // Reset detail view when navigating to /account/transation without ID
  useEffect(() => {
    if (pathname === "/account/transation" && !selectedTransactionId) {
      setTransactionDetails(null);
    }
  }, [pathname, selectedTransactionId]);

  const formatNumber = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) return value ?? "-";
    return Number(value).toLocaleString("en-IN");
    
  };


  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = Cookies.get("accessToken");
        const investorCookie = Cookies.get("investor");
        let investorId = null;

        // ✅ Parse the investor cookie (it's JSON)
        if (investorCookie) {
          try {
            const parsedInvestor = JSON.parse(decodeURIComponent(investorCookie));
            investorId = parsedInvestor?.id;
          } catch (e) {
            console.error("❌ Failed to parse investor cookie:", e);
          }
        }

        console.log("🔑 Token:", token);
        console.log("🧍 Investor ID:", investorId);

        if (!investorId) {
          setError("Investor ID not found in cookies");
          setLoading(false);
          return;
        }

        const url = `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/transactions/investors-transaction/${investorId}`;
        console.log("🌐 Fetching from:", url);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          // credentials: "include",
        });

        const rawText = await response.text();
        console.log("📦 Raw API Response:", rawText);

        let data;
        try {
          data = JSON.parse(rawText);
        } catch (e) {
          console.error("❌ Failed to parse JSON:", e);
          setError("Invalid JSON response from server");
          setLoading(false);
          return;
        }

        if (!response.ok) {
          console.error("❌ HTTP Error:", response.status, data);
          setError(`HTTP ${response.status}: ${data.message || "Unknown error"}`);
          setLoading(false);
          return;
        }

        const transactionsData = data?.data?.data || [];
        console.log("✅ Parsed Transactions:", transactionsData);

        setTransactions(transactionsData);
      } catch (err) {
        console.error("❌ Fetch Error:", err);
        setError("Network error while fetching transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);


  // ✅ Fetch transaction details when selectedTransactionId changes
  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!selectedTransactionId) return;

      setLoading(true);
      try {
        const token = Cookies.get("accessToken");
        const url = `${process.env.NEXT_PUBLIC_USER_BASE}investor/api/transactions/company-transactions-detail/${selectedTransactionId}`;
        console.log("🔍 Fetching details:", url);

        const res = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await res.json();
        console.log("📦 Transaction Detail:", data);

        if (!res.ok) throw new Error(data.message || "Failed to fetch details");
        setTransactionDetails(data.data);
      } catch (err) {
        console.error("❌ Detail Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [selectedTransactionId]);


  const handleViewDetails = (transactionId) => {
    router.push(`/account/transation?id=${transactionId}`);
  };

  // Handle Back to List - Remove ID from URL
  const handleBackToList = () => {
    router.push("/account/transation");
  };

  // ====== Loading State ======
  if (loading && !transactionDetails) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  
  if (!transactions.length) {
    return (
      <div className={styles.container}>
        <h2 className={styles.heading}>Transaction</h2>
        <div className={styles.hr}></div>
        <p style={{ textAlign: "center", color: "#6B7280" }}>
          No transactions found.
        </p>
      </div>
    );
  }


  // ✅ Use API data for detail view
  const investments = transactionDetails
    ? [
      {
        company_name: transactionDetails.company?.name || "N/A",
        category: transactionDetails.company?.tags ,
        pan: transactionDetails.user?.pan || "N/A",
        applicant_name: transactionDetails.user?.applicant_name || "N/A",
        father_name: transactionDetails.user?.father_name || "N/A",
        email: transactionDetails.user?.email || "N/A",
        mobile: transactionDetails.user?.mobile_number || "N/A",
        min_lot: transactionDetails.company?.min_investment_lot_size,
        amount_to_invest: transactionDetails.company?.min_investment_per_lots,
        lotSize: transactionDetails?.transaction?.status_steps[0]?.lot_size,
        invested_amount: transactionDetails?.transaction?.status_steps[0]?.amount_inr,
        date: transactionDetails.transaction?.date,
        company_logo:
          transactionDetails.company?.logo_url?.[0]?.path
            ? `${process.env.NEXT_PUBLIC_USER_BASE}${transactionDetails.company.logo_url[0].path.replace(
              "public/",
              "admin/"
            )}`
            : "/transaction/cardAnthem-image.svg",
      },
    ]
    : [];



const mainData = transactionDetails
  ? {
      date: new Date(transactionDetails.transaction?.date).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ),

      tasks: transactionDetails.transaction?.status_steps
        // ✅ REMOVE Scheduled Meeting step completely
        ?.filter((step) => step.step !== "Scheduled Meeting")

        // ✅ THEN map remaining steps
        .map((step) => {
          const latestHistory = step.history?.length
            ? step.history[step.history.length - 1]
            : {};

          const isVerified = [
            "completed",
            "Completed",
            "Verified",
            "Payment Verified",
          ].includes(step.status?.trim());

          return {
            title: step.step,
            status: isVerified ? "verified" : "pending",
            time: latestHistory?.time || step.time || null,
            amount: step.amount_inr || latestHistory?.amount || "N/A",
            units: step.units_per_lot || "N/A",
            lotSize: step.lot_size ?? latestHistory?.lot_size ?? "N/A",
            bank: step.bank || latestHistory?.bank || "N/A",
            accountNumber: step.account_number || "N/A",
            shareApplicationForm: step.share_application_form || "N/A",
            payment_transaction_id:
              latestHistory?.payment_transaction_id || null,
            payment_mode: latestHistory?.payment_mode || null,
            payment_date: latestHistory?.payment_date || null,

            // document data
            document_url: latestHistory?.document_url || null,
          };
        }),
    }
  : { date: "", tasks: [] };








  // ====== Detail View ======
  if (selectedTransactionId && transactionDetails) {
    // 👇 Your HTML unchanged
    return (
      <>

        <div>
          {/* <button
            onClick={handleBackToList}
            className={styles.backButton}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#B59131",
              fontWeight: "500",
              marginBottom: "16px",
              fontSize: "16px",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.833 10H4.16634"
                stroke="#B59131"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 15.8333L4.16667 9.99996L10 4.16663"
                stroke="#B59131"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
           
          </button> */}

        </div>
        <h2 className={styles.heading}>Transaction</h2>
        <div className={styles.hr}></div>
        <div className={styles.detailWrapper}>
          <div className={styles.container}>
            {investments.map((item, index) => (
              <div key={index} className={`${styles.card} ${styles.detailCard}`}>
                {/* === Top Bar === */}
                <div className={styles.topBar}>
                  <div className={styles.status}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21.8 10C22.26 12.24 21.93 14.57 20.88 16.6C19.83 18.63 18.11 20.24 16.01 21.16C13.92 22.07 11.57 22.25 9.36 21.64C7.16 21.04 5.22 19.7 3.89 17.84C2.55 15.99 1.89 13.73 2.02 11.44C2.14 9.16 3.05 6.99 4.58 5.29C6.12 3.59 8.19 2.47 10.45 2.12C12.71 1.76 15.02 2.19 17 3.33"
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
                    <span className={styles.shownInterestDetails}>Shown interest</span>
                  </div>
                  <span className={styles.dateDetails}>
                    {(() => {
                      const date = new Date(item.date);
                      const day = date.toLocaleDateString("en-GB", { day: "2-digit" });
                      const month = date.toLocaleDateString("en-GB", { month: "short" });
                      const year = date.toLocaleDateString("en-GB", { year: "numeric" });
                      return `${day} ${month}, ${year}`;
                    })()}
                  </span>
                </div>

                {/* === Company Info === */}
                <div className={styles.companyInfo}>
                  <Image
                    src={item.company_logo}
                    alt={item.company_name}
                    width={34}
                    height={34}
                    unoptimized
                  />
                  <div className={styles.companyInfoDetails}>
                    <h3 className={styles.companyName}>{item.company_name || "N/A"}</h3>
                    {/* <p className={styles.categoryForDetails}>{item.category}</p> */}
                    {/* <p className={styles.categoryForDetails}>
                      {transactionDetails.company?.tags && transactionDetails.company.tags.length > 0
                        ? transactionDetails.company.tags.join(" ")
                        : item.category}
                    </p> */}
                    <div className={styles.categoryForDetails}>
                      {transactionDetails.company?.tags && transactionDetails.company.tags.length > 0 ? (
                        transactionDetails.company.tags.map((tag, index) => (
                          <span key={index} className={styles.detailTag}>
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className={styles.noTag}>{item.category}</span>
                      )}
                    </div>


                  </div>
                </div>

                {/* === User Details === */}
                <div className={styles.detailsGrid}>
                  <div className={styles.detail}>
                    <p className={styles.label}>PAN</p>
                    <p className={styles.value}>{item.pan}</p>
                  </div>
                  <div className={styles.detail}>
                    <p className={styles.label}>Applicant name</p>
                    <p className={styles.value}>{item.applicant_name}</p>
                  </div>
                </div>

                <div className={styles.detailsGrid}>
                  <div className={styles.detail}>
                    <p className={styles.label}>Father’s Name</p>
                    <p className={styles.value}>{item.father_name}</p>
                  </div>
                  <div className={styles.detail}>
                    <p className={styles.label}>Email</p>
                    <p className={styles.value}>{item.email}</p>
                  </div>
                </div>

                <div className={styles.detailsGrid}>
                  <div className={styles.detail}>
                    <p className={styles.label}>Mobile Number</p>
                    <p className={styles.value}>{item.mobile}</p>
                  </div>
                  <div className={styles.detail}>
                    <p className={styles.label}>Minimum investment</p>
                    <p className={styles.value}>{(item.min_lot != null && item.amount_to_invest != null) ? `${item.min_lot} Lots , ₹${formatNumber(item.amount_to_invest)}` : "N/A"}</p>
                  </div>
                </div>

                <div className={styles.detailsGrid}>
                  <div className={styles.detail}>
                    <p className={styles.label}>Amount I want to invest</p>
                    <p className={styles.value}>{item.lotSize} Lots,  ₹{formatNumber(item.invested_amount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.buttonContainer}>
            <h2 className={styles.heading}>Track status</h2>
            <div className={styles.hr}></div>
          </div>

        </div >
        <div className={styles.mainSubCont}>
          <div className={styles.subcardcont}>
            {/* <span className={styles.mainDate}>{mainData.date}</span> */}
            <span className={styles.mainDate}>
              {(() => {
                const date = new Date(mainData.date);
                const day = date.toLocaleDateString("en-GB", { day: "2-digit" });
                const month = date.toLocaleDateString("en-GB", { month: "short" });
                const year = date.toLocaleDateString("en-GB", { year: "numeric" });
                const time = date.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });
                return `${month} ${day}, ${year}`;
              })()}
            </span>

            <div className={styles.verticalLine}></div>

            {mainData.tasks.map((task, index) => (
              <div key={index} className={styles.taskStatusCont}>
                {/* <div className={styles.verticalLine}></div> */}
                <div className={styles.verticalLineCont}>
                  {task.status === "verified" ? (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="1.14286"
                        y="1.14286"
                        width="29.7143"
                        height="29.7143"
                        rx="14.8571"
                        fill="#F0FDF4"
                      />
                      <rect
                        x="1.14286"
                        y="1.14286"
                        width="29.7143"
                        height="29.7143"
                        rx="14.8571"
                        stroke="#16A34A"
                        strokeWidth="2.28571"
                      />
                      <path
                        d="M22.0957 11.4282L13.7148 19.8092L9.90527 15.9997"
                        stroke="#16A34A"
                        strokeWidth="2.28571"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="1.14286"
                        y="1.14286"
                        width="29.7143"
                        height="29.7143"
                        rx="14.8571"
                        fill="#F8FAFC"
                      />
                      <rect
                        x="1.14286"
                        y="1.14286"
                        width="29.7143"
                        height="29.7143"
                        rx="14.8571"
                        stroke="#E2E8F0"
                        strokeWidth="2.28571"
                      />
                      <rect x="9" y="9" width="14" height="14" rx="7" fill="#E2E8F0" />
                    </svg>
                  )}
                </div>

                <div className={styles.taskStatusContRight}>
                  <div className={styles.tastHead}>
                    {task.time && (
                      <div className={styles.updateTime}>
                        {new Date(task.time).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>
                    )}
                    <div className={styles.tastHeadName}>{task.title}</div>
                  </div>

                  {(task.status === "verified" || task.title === "Scheduled Meeting") ? (
                    <div className={styles.tastCard}>
                      {task.title === "User Show Interested" && (
                        <>
                          {/* <div className={styles.taskStatusDetails}>
                            <div className={styles.taskStatusDetailsItem}>
                              <p className={styles.label}>Amount (₹)</p>
                              <p className={styles.value}>₹ {formatNumber(task.amount)}</p>
                            </div>
                            <div className={styles.taskStatusDetailsItem}>
                              <p className={styles.label}>Units Per Lot</p>
                              <p className={styles.value}>{task.units}</p>
                            </div>
                            <div className={styles.taskStatusDetailsItem}>
                              <p className={styles.label}>Lot Size</p>
                              <p className={styles.value}>{task.lotSize}</p>
                            </div>
                          </div> */}

                          <div className={styles.taskStatusDetails}>
                            {/* <div className={styles.taskStatusDetailsItem}>
                              <p className={styles.label}>Bank</p>
                              <p className={styles.value}>{task.bank}</p>
                            </div>
                            <div className={styles.taskStatusDetailsItem}>
                              <p className={styles.label}>Account Number</p>
                              <p className={styles.value}>{task.accountNumber}</p>
                            </div> */}
                            <div className={styles.taskStatusDetailsItem}>
                              <p className={styles.label}>Share Application Form</p>
                              <a
                                href={
                                  task.shareApplicationForm !== "N/A"
                                    ? `${process.env.NEXT_PUBLIC_USER_BASE}investor${task.shareApplicationForm.replace("https://api.preqt.club/investor", "")}`
                                    : ""
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.link}
                              >
                                <div className={styles.docCont}>
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V7L15 2Z" stroke="#B59131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M14 2V6C14 6.53043 14.2107 7.03914 14.5858 7.41421C14.9609 7.78929 15.4696 8 16 8H20" stroke="#B59131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10 9H8" stroke="#B59131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M16 13H8" stroke="#B59131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M16 17H8" stroke="#B59131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  <div className={styles.docName}>Applicationform.pdf</div>

                                </div>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M7 7H17V17" stroke="#C9A74E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M7 17L17 7" stroke="#C9A74E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>

                              </a>
                            </div>
                          </div>


                        </>

                      )}


                      {/* 🧩 Conditional Rendering per Step */}
                      {/* ✅ Scheduled Meeting */}
                      {/* {task.title === "Scheduled Meeting" && (
                        <div className={`${styles.taskStatusDetails} ${styles.meetingLinkItem}`}>
                          {task.meeting_history && task.meeting_history.length > 0 ? (
                            task.meeting_history.map((meeting, index) => (
                              <div key={meeting.id || index} className={`${styles.taskStatusDetailsItem} ${styles.docDetailsItme}`}>
                                <div className={styles.meetingHeadTime}>
                                  <p className={styles.label}>Meeting Link {index + 1}</p>
                                  {meeting.time && (
                                    <p className={styles.label}>
                                      {new Date(meeting.time).toLocaleString("en-GB")}
                                    </p>
                                  )}
                                </div>

                                <a
                                  href={meeting.meeting_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.link}
                                >
                                  {meeting.meeting_link}
                                </a>


                              </div>
                            ))
                          ) : (
                            <div className={styles.taskStatusDetailsItem}>
                              <p className={styles.label}>Meeting Link</p>
                              <p className={styles.value} style={{ color: "#9CA3AF" }}>
                                (Link not available yet)
                              </p>
                            </div>
                          )}

                          {task.meeting_platform && (
                            <div className={styles.taskStatusDetailsItem}>
                              <p className={styles.label}>Platform</p>
                              <p className={styles.value}>{task.meeting_platform}</p>
                            </div>
                          )}

                          {task.meeting_date && (
                            <div className={styles.taskStatusDetailsItem}>
                              <p className={styles.label}>Meeting Date</p>
                              <p className={styles.value}>
                                {new Date(task.meeting_date).toLocaleString("en-GB")}
                              </p>
                            </div>
                          )}
                        </div>
                      )} */}



                      {/* ✅ Payment Details */}
                      {task.payment_transaction_id && (
                        <div className={styles.taskStatusDetails}>
                          <div className={styles.taskStatusDetailsItem}>
                            <p className={styles.label}>Transaction ID</p>
                            <p className={styles.value}>{task.payment_transaction_id}</p>
                          </div>
                          <div className={styles.taskStatusDetailsItem}>
                            <p className={styles.label}>Payment Mode</p>
                            <p className={styles.value}>{task.payment_mode}</p>
                          </div>
                          <div className={styles.taskStatusDetailsItem}>
                            <p className={styles.label}>Amount</p>
                            <p className={styles.value}>₹{formatNumber(task.amount)}</p>
                          </div>
                          <div className={styles.taskStatusDetailsItem}>
                            <p className={styles.label}>Payment Date</p>
                            <p className={styles.value}>
                              {task.payment_date
                                ? new Date(task.payment_date).toLocaleDateString("en-GB")
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* ✅ Documents */}
                      {task.document_url && (
                        <div className={styles.taskStatusDetails}>
                          <div className={`${styles.taskStatusDetailsItem} ${styles.docDetailsItme}`}>
                            <p className={styles.label}>Uploaded Document</p>
                            <a
                              href={`${process.env.NEXT_PUBLIC_USER_BASE}${task.document_url.replace(
                                "public/",
                                "admin/"
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.link}
                            >
                              <div className={styles.docCont}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M15 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V7L15 2Z" stroke="#B59131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M14 2V6C14 6.53043 14.2107 7.03914 14.5858 7.41421C14.9609 7.78929 15.4696 8 16 8H20" stroke="#B59131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M10 9H8" stroke="#B59131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M16 13H8" stroke="#B59131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M16 17H8" stroke="#B59131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className={styles.docName}>Invoice.pdf</div>

                              </div>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 7H17V17" stroke="#C9A74E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M7 17L17 7" stroke="#C9A74E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>

                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (task.status === "pending" ? (
                    <div className={styles.tastCard}>
                      <div className={styles.taskStatusDetails}>
                        <div className={styles.taskStatusDetailsItem}>
                          <p className={styles.label}></p>
                          <p className={`${styles.value} ${styles.pendingValue}`} >Pending</p>
                        </div>
                      </div>
                    </div>
                  ) : null)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  // ====== Data Render ======
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Transaction</h2>
      <div className={styles.hr}></div>

      <div className={styles.grid}>
        {transactions.map((t, index) => {
          const company = t.deal_details?.company_name;
          const logoPath = t.deal_details?.company_logo?.[0]?.path || null;
          const logoUrl = logoPath
            ? `${process.env.NEXT_PUBLIC_USER_BASE}${logoPath}`
              .trim()
              .replace("/public/", "/admin/")
            : "/transaction/cardAnthem-image.svg";

          const minLot =
            t.deal_details?.min_investment_lot_size || "N/A";
          const dealData = t.deal_details?.deal_data?.data || t.deal_details;
          const getNumeric = (val) => {
              if (val === null || val === undefined) return NaN;
              if (typeof val === 'number') return val;
              const clean = String(val).replace(/[^0-9.]/g, '');
              const num = parseFloat(clean);
              return isNaN(num) ? NaN : num;
          };
          const lotSize = getNumeric(dealData?.min_investment_lot_size);
          const perSharePrice = getNumeric(dealData?.per_share_price || dealData?.offer_price);
          const lotSizeShare = getNumeric(dealData?.lot_size_share);
          
          let calculated = dealData?.min_investment_amount_in_inr;
          if (!isNaN(lotSize) && !isNaN(perSharePrice) && !isNaN(lotSizeShare)) {
              calculated = lotSize * perSharePrice * lotSizeShare;
          }
          const minInvestment = calculated || "N/A";
          const amount = t.amount ? `₹${t.amount.toLocaleString()}` : "N/A";
          const lots = t.lots || "N/A";
          const tags = t.deal_details?.tags?.join(", ") || "-";

          return (
            <div key={index} className={styles.card}>
              <div className={styles.topContainer}>
                {/* ===== Top Bar ===== */}
                <div className={styles.topBar}>
                  <div className={styles.status}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21.8006 9.99999C22.2573 12.2413 21.9318 14.5714 20.8785 16.6018C19.8251 18.6322 18.1075 20.24 16.0121 21.1573C13.9167 22.0746 11.5702 22.2458 9.36391 21.6424C7.15758 21.0389 5.2248 19.6974 3.88789 17.8414C2.55097 15.9854 1.89073 13.7272 2.01728 11.4434C2.14382 9.15952 3.04949 6.98808 4.58326 5.29116C6.11703 3.59424 8.18619 2.47442 10.4457 2.11844C12.7052 1.76247 15.0184 2.19185 16.9996 3.33499"
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
                    <span className={styles.shownInterest}>
                      Shown interest
                    </span>
                  </div>
                  <span className={styles.date}>
                    {(() => {
                      const date = new Date(t.createdAt);
                      const day = date.toLocaleDateString("en-GB", { day: "2-digit" });
                      const month = date.toLocaleDateString("en-GB", { month: "short" });
                      const year = date.toLocaleDateString("en-GB", { year: "numeric" });
                      return `${day} ${month}, ${year}`;
                    })()}
                  </span>
                </div>

                {/* ===== Company Info ===== */}
                <div className={styles.companyInfo}>
                  <Image className={styles.companyLogo}
                    src={logoUrl}
                    alt="logo"
                    width={34}
                    height={34}
                    unoptimized
                  />
                  <div className={styles.companyInfoHeader}>
                    <h3 className={styles.company}>{company || "N/A"}</h3>
                    <div className={styles.subInfo}>
                      {Array.isArray(t.deal_details?.tags) && t.deal_details.tags.length > 0 ? (
                        t.deal_details.tags.map((tag, i) => (
                          <span key={i}>
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className={styles.noTag}></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ===== Investment Details ===== */}
                <div className={styles.investmentDetails}>
                  <div className={styles.investmentDetailsSubItem}>
                    <p className={styles.label}>Minimum investment</p>
                    <p className={styles.value}>
                      {(minLot !== "N/A" && minInvestment !== "N/A")
                        ? `${minLot} Lots, ₹${formatNumber(minInvestment)}`
                        : "N/A"}
                    </p>
                    
                  </div>
                  <div className={styles.investmentDetailsSubItem}>
                    <p className={styles.label}>Amount I want to invest</p>
                    <p className={styles.value}>
                      {lots} Lots, {amount}
                    </p>
                  </div>
                </div>

                <div className={styles.investmentDetails}>
                  <div className={styles.investmentDetailsSubItem}>
                    <p className={styles.label}>PAN</p>
                    <p className={styles.value}>{t.pan_number}</p>
                  </div>
                  <div className={styles.investmentDetailsSubItem}>
                    <p className={styles.label}>Applicant name</p>
                    <p className={styles.value}>{t.applicant_name}</p>
                  </div>
                </div>
              </div>

              {/* ===== View Details Button ===== */}
              <button
                className={styles.viewButton}
                onClick={() => handleViewDetails(t.id || t._id || index)}
              >
                <span>View Details</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.16699 10H15.8337"
                    stroke="#B59131"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 4.16663L15.8333 9.99996L10 15.8333"
                    stroke="#B59131"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}