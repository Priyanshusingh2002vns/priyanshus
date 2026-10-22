"use client";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Loader from "@/app/components/Loader";
import { showErrorToast, showSuccessToast } from "@/app/components/ToastProvider";

export default function Page() {
  const [documentsData, setDocumentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null); // 👈 for button loader

  // ---------------------------
  // SEND DOCUMENT BY EMAIL
  // ---------------------------

  const joinUrl = (base, path) => {
    return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  };

  const handleEmailDocument = async (transactionId, documentUrl) => {
    try {
      setSendingId(documentUrl);

      const base = process.env.NEXT_PUBLIC_USER_BASE;
      const docUrl = documentUrl.replace("public", "admin");

      const token = Cookies.get("accessToken");

      const payload = {
        documentUrl: docUrl,
      };

      const response = await fetch(
        `${base}/investor/api/investor/${transactionId}/documents/email`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (data.status === 200) {
        showSuccessToast("Document emailed successfully.");
      } else {
        showErrorToast("Failed to send email.");
      }
    } catch (error) {
      console.error("Email send error:", error);
      showErrorToast("Something went wrong.");
    } finally {
      setSendingId(null);
    }
  };


  // ---------------------------
  // GET DOCUMENTS
  // ---------------------------
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = Cookies.get("accessToken");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_USER_BASE}/investor/api/investor/get-documents`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const json = await res.json();

        if (json.status === 200) {
          setDocumentsData(json.data.data.deals);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);



  if (loading) return <Loader />;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>My Documents</h2>
      <div className={styles.divider}></div>

      {documentsData.length === 0 ? (
        <div className={styles.noDocuments}>
          <img src="/account-mydocument/nodocImag.png" alt="nodocImag" />
          <div className={styles.noDoctextCont}>
            <div className={styles.noDocText}>
              <h4>No Documents Available Yet</h4>
              <p>
                Once you show interest in a deal and your application is processed,
                your PAS documents will appear here.
              </p>
            </div>
            <div className={styles.linkcont}>
              <a href="/">Explore Deals to Get Started</a>
              <img src="/rightArrow.svg" alt="rightArrow" />
            </div>
          </div>
        </div>
      ) : (
        documentsData.map((deal, index) => (
          <div key={index} className={styles.documentsContainer}>
            {/* Deal Heading */}
            {/* Deal Heading */}
            <div className={styles.documentHead}>

              {(() => {
                const logoPath = deal?.company_logo?.[0]?.path;

                // Build FINAL URL safely
                const finalLogoUrl = logoPath
                  ? `${process.env.NEXT_PUBLIC_USER_BASE}admin/${logoPath.replace("public/", "")}`
                  : "/logo-fallback.png";

                return (
                  <img
                    src={finalLogoUrl}
                    alt="Company Logo"
                    onError={(e) => {
                      e.target.onerror = null; // prevent infinite loop
                      e.target.src = "/logo-fallback.png";
                    }}
                  />
                );
              })()}

              <h3>{deal.deal_name || "N/A"}</h3>
            </div>


            {/* Transactions */}
            {deal.transactions.map((txn) =>
              txn.documents.length > 0 ? (
                <div key={txn.transaction_id} className={styles.documentsFiles}>
                  {txn.documents.map((doc) => (
                    <div key={doc.id} className={styles.documentsItems}>
                      <div className={styles.filesName}>
                        <img
                          src="/account-mydocument/filenameAttach.svg"
                          alt="document icon"
                        />
                        <p>{doc.label}</p>
                      </div>

                      {/* Email To Me Button */}
                      <button
                        className={styles.emailBtn}
                        onClick={() =>
                          handleEmailDocument(txn.transaction_id, doc.url)
                        }
                        disabled={sendingId === doc.url}
                      >
                        {sendingId === doc.url ? (
                           <span className={styles.spinner}></span>
                        ) : (
                          <>
                            <img
                              className={styles.icon}
                              src="/account-mydocument/mail-inbox.svg"
                              alt="email icon"
                            />
                            Email to me
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div key={txn.transaction_id} className={styles.documentsFiles}>
                  <div className={styles.documentsItems}>
                    <div className={styles.noDocBox}>
                      <p>No documents for this transaction.</p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        ))
      )}
    </div>
  );
}
