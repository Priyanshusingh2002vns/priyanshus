"use client";
import React, { useState, useEffect } from "react";
import styles from "./Business.module.css";
import { ChevronDown, X } from "lucide-react";
import { Collapse } from "react-bootstrap";
import { useDealStore } from "@/store/dealStore";

// ✅ Reusable SafeImage component
const SafeImage = ({ src, alt, className, style }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isVisible || !src) return null;

  const handleImageClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setIsModalOpen(false);
  };

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ ...style, cursor: "pointer" }}
        onClick={handleImageClick}
        onError={(e) => {
          e.target.onerror = null;
          setIsVisible(false);
        }}
      />
      {isModalOpen && (
        <div 
          onClick={handleClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
            cursor: "zoom-out"
          }}
        >
          <button
            onClick={handleClose}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              color: "#fff",
              cursor: "pointer",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100000,
              transition: "background-color 0.2s, transform 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <X size={24} strokeWidth={2} />
          </button>
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "80%",
              maxHeight: "80%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "default"
            }}
          >
            <img
              src={src}
              alt={alt}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                borderRadius: "8px",
                backgroundColor: "#fff",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
                padding: "8px"
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

// ✅ Dropdown Component
const Dropdown = ({ title, children, isOpen, onToggle, isPrivateDeal }) => (
  <div className={styles.dropdown}>
    <div className={styles.header} onClick={() => onToggle(title)}>
      <h3 className={styles.title}>{title}</h3>
      <span className={`${styles.iconWrapper} ${isOpen ? styles.open : ""}`}>
        <ChevronDown size={24} color={isPrivateDeal ? "white" : "black"} />
      </span>
    </div>

    <Collapse in={isOpen} mountOnEnter unmountOnExit={false}>
      <div className={styles.content}>{children}</div>
    </Collapse>
  </div>
);

const dummyProducts = [
  { name: "Product A", uploadedFileData: { path: "public/assets/pictures/default.png", mimeType: "image/png" } },
  { name: "Product B", uploadedFileData: { path: "public/assets/pictures/default.png", mimeType: "image/png" } },
  { name: "Product C", uploadedFileData: { path: "public/assets/pictures/default.png", mimeType: "image/png" } },
];

const dummyServices = [
  { name: "Service X", uploadedFileData: { path: "public/assets/pictures/default.png", mimeType: "image/png" } },
  { name: "Service Y", uploadedFileData: { path: "public/assets/pictures/default.png", mimeType: "image/png" } },
  { name: "Service Z", uploadedFileData: { path: "public/assets/pictures/default.png", mimeType: "image/png" } },
];

const Business = ({ isPrivateDeal, dealDetails: dealDetailsProp }) => {
  const dealDetailsFromStore = useDealStore((state) => state.dealDetails);
  const dealDetails = dealDetailsProp || dealDetailsFromStore;
  const business = dealDetails?.data?.business;
  const companyName = dealDetails?.data?.deal_setpData?.company_name || "Company"; // ✅ Fallback for missing name

  const renderFiles = (files) => {
    if (!files || !Array.isArray(files) || files.length === 0) return null;

    return (
      <div className={styles.clients} style={{ marginTop: "16px", marginBottom: "16px" }}>
        {files.map((file, idx) => {
          const isImage = file?.mimeType?.startsWith("image/");
          const isVideo = file?.mimeType?.startsWith("video/");
          
          const cleanedPath = file?.path ? file.path.replace(/^\/+/, "").replace(/^public\//, "") : "";
          const baseUrl = process.env.NEXT_PUBLIC_USER_BASE || "";
          const baseAdmin = baseUrl.endsWith("/") ? `${baseUrl}admin` : `${baseUrl}/admin`;
          const normalizedPath = cleanedPath.startsWith("/") ? cleanedPath : `/${cleanedPath}`;
          const fileUrl = `${baseAdmin}${normalizedPath}`;

          const altText = `${file.fileName || "Media"} - ${companyName}`;

          return (
            <div key={idx} className={styles.card} style={{ height: "150px" }}>
              <div className={styles.imageWrapper}>
                {isImage ? (
                  <SafeImage
                    src={fileUrl}
                    alt={altText}
                    className={styles.cardImage}
                  />
                ) : isVideo ? (
                  <video
                    src={fileUrl}
                    controls
                    className={styles.cardImage}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Determine data sources for Products and Services
  const productsObj = business?.products_and_services?.status 
    ? business.products_and_services.data?.products 
    : business?.products;
    
  const servicesObj = business?.products_and_services?.status 
    ? business.products_and_services.data?.services 
    : business?.services;

  const productsData = Array.isArray(productsObj?.data) ? productsObj.data : null;
  const productsTitle = productsObj?.label_name || "Products";

  const servicesData = Array.isArray(servicesObj?.data) ? servicesObj.data : null;
  const servicesTitle = servicesObj?.label_name || "Services";

  const businessModelTitle = business?.business_model?.label_name || "Business Model";
  const salesChannelTitle = business?.sales_channel?.label_name || "Sales Channel";

  const keyRiskFactorsObj = business?.key_risk_factors;
  const keyRiskFactorsData = Array.isArray(keyRiskFactorsObj?.data)
    ? keyRiskFactorsObj.data
    : Array.isArray(keyRiskFactorsObj?.data?.data)
      ? keyRiskFactorsObj.data.data
      : null;
  const keyRiskFactorsTitle = keyRiskFactorsObj?.label_name || "Key Risk Factors";

  const [openStates, setOpenStates] = useState({});

  useEffect(() => {
    if (business) {
      setOpenStates({
        [productsTitle]: true,
        [servicesTitle]: true,
        [businessModelTitle]: !!business?.business_model?.status,
        "Geographical Presence": !!business?.geographical_presence?.status,
        [salesChannelTitle]: !!business?.sales_channel?.status,
        "Clients": !!business?.clients?.status,
        [keyRiskFactorsTitle]: !!business?.key_risk_factors?.status,
      });
    }
  }, [business, productsTitle, servicesTitle, businessModelTitle, salesChannelTitle, keyRiskFactorsTitle]);

  const toggleDropdown = (title) => {
    setOpenStates((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  if (!business) return null;

  const activeSections = [];

  if (productsData && productsData.length > 0) {
    activeSections.push(
      <Dropdown
        key="products"
        title={productsTitle}
        isOpen={openStates[productsTitle]}
        onToggle={toggleDropdown}
        isPrivateDeal={isPrivateDeal}
      >
        <div className={styles.clients}>
          {productsData.map((item, index) => {
            const file = item.uploadedFileData;
            const imagePath = file?.path?.replace("public", "");
            const isImage = file?.mimeType?.startsWith("image/");
            const imageUrl = isImage
              ? `${process.env.NEXT_PUBLIC_USER_BASE}admin/${imagePath}`
              : "/assets/pictures/default.png";

            const altText = `${item.name || "Product"} - ${companyName}`;

            return (
              <div key={index} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <SafeImage
                    src={imageUrl}
                    alt={altText}
                    className={styles.cardImage}
                  />
                  <div className={styles.overlay}></div>
                  <div className={styles.productName}>{item.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Dropdown>
    );
  }

  if (servicesData && servicesData.length > 0) {
    activeSections.push(
      <Dropdown
        key="services"
        title={servicesTitle}
        isOpen={openStates[servicesTitle]}
        onToggle={toggleDropdown}
        isPrivateDeal={isPrivateDeal}
      >
        <div className={styles.clients}>
          {servicesData.map((item, index) => {
            const file = item.uploadedFileData;
            const imagePath = file?.path?.replace("public", "");
            const isImage = file?.mimeType?.startsWith("image/");
            const imageUrl = isImage
              ? `${process.env.NEXT_PUBLIC_USER_BASE}admin/${imagePath}`
              : "/assets/pictures/default.png";

            const altText = `${item.name || "Service"} - ${companyName}`;

            return (
              <div key={index} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <SafeImage
                    src={imageUrl}
                    alt={altText}
                    className={styles.cardImage}
                  />
                  <div className={styles.overlay}></div>
                  <div className={styles.productName}>{item.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Dropdown>
    );
  }

const hasNodeData = (node) => {
  if (!node || node.status === false) return false;
  const d = node.data;
  if (typeof d === "string") return d.trim().length > 0;
  if (Array.isArray(d)) return d.length > 0;
  if (Array.isArray(d?.data)) return d.data.length > 0;
  if (d?.content && String(d.content).trim().length > 0) return true;
  if (Array.isArray(node.files) && node.files.length > 0) return true;
  return false;
};

  if (hasNodeData(business?.business_model)) {
    activeSections.push(
      <Dropdown
        key="model"
        title={businessModelTitle}
        isOpen={openStates[businessModelTitle]}
        onToggle={toggleDropdown}
        isPrivateDeal={isPrivateDeal}
      >
        {business.business_model ? (
          <div className={styles.pTag}>
            {typeof business.business_model.data === "string" ? (
              <div
                className={styles.businessModal}
                dangerouslySetInnerHTML={{ __html: business.business_model.data }}
              />
            ) : Array.isArray(business.business_model.data?.data) ? (
              business.business_model.data.data.map((item, index) => (
                <div key={index} className={styles.pTag} style={{ paddingLeft: "0", paddingRight: "0" }}>
                  {item.label_name && <strong className={styles.strong}>{item.label_name}</strong>}
                  <div className={styles.businessModal} dangerouslySetInnerHTML={{ __html: item.content }} />
                  {renderFiles(item.files)}
                </div>
              ))
            ) : Array.isArray(business.business_model.data) ? (
              business.business_model.data.map((item, index) => (
                <div key={index} className={styles.pTag} style={{ paddingLeft: "0", paddingRight: "0" }}>
                  {item.label_name && <strong className={styles.strong}>{item.label_name}</strong>}
                  <div className={styles.businessModal} dangerouslySetInnerHTML={{ __html: item.content }} />
                  {renderFiles(item.files)}
                </div>
              ))
            ) : business.business_model.data?.content ? (
              <div>
                <div className={styles.businessModal} dangerouslySetInnerHTML={{ __html: business.business_model.data.content }} />
                {renderFiles(business.business_model.data.files)}
              </div>
            ) : null}
            {renderFiles(business.business_model.files)}
          </div>
        ) : null}
      </Dropdown>
    );
  }

  if (hasNodeData(business?.geographical_presence)) {
    activeSections.push(
      <Dropdown
        key="geo"
        title="Geographical Presence"
        isOpen={openStates["Geographical Presence"]}
        onToggle={toggleDropdown}
        isPrivateDeal={isPrivateDeal}
      >
        {typeof business.geographical_presence.data === "string" ? (
          <div
            className={styles.businessModal}
            dangerouslySetInnerHTML={{ __html: business.geographical_presence.data }}
          />
        ) : Array.isArray(business.geographical_presence.data?.data) ? (
          business.geographical_presence.data.data.map((item, index) => (
            <div key={index} className={styles.pTag}>
              {item.label_name && <strong className={styles.strong}>{item.label_name}</strong>}
              <div className={styles.businessModal} dangerouslySetInnerHTML={{ __html: item.content }} />
              {renderFiles(item.files)}
            </div>
          ))
        ) : Array.isArray(business.geographical_presence.data) ? (
          business.geographical_presence.data.map((item, index) => (
            <div key={index} className={styles.pTag}>
              {item.label_name && <strong className={styles.strong}>{item.label_name}</strong>}
              <div className={styles.businessModal} dangerouslySetInnerHTML={{ __html: item.content }} />
              {renderFiles(item.files)}
            </div>
          ))
        ) : business.geographical_presence.data?.content ? (
          <div className={styles.pTag}>
            <div className={styles.businessModal} dangerouslySetInnerHTML={{ __html: business.geographical_presence.data.content }} />
            {renderFiles(business.geographical_presence.data.files)}
          </div>
        ) : null}
      </Dropdown>
    );
  }

  if (hasNodeData(business?.sales_channel)) {
    activeSections.push(
      <Dropdown
        key="sales"
        title={salesChannelTitle}
        isOpen={openStates[salesChannelTitle]}
        onToggle={toggleDropdown}
        isPrivateDeal={isPrivateDeal}
      >
        {business.sales_channel ? (
          <div className={styles.pTag}>
            {typeof business.sales_channel.data === "string" ? (
              <div
                className={styles.businessModal}
                dangerouslySetInnerHTML={{ __html: business.sales_channel.data }}
              />
            ) : Array.isArray(business.sales_channel.data?.data) ? (
              business.sales_channel.data.data.map((item, index) => (
                <div key={index} className={styles.pTag} style={{ paddingLeft: "0", paddingRight: "0" }}>
                  {item.label_name && <strong className={styles.strong}>{item.label_name}</strong>}
                  <div className={styles.businessModal} dangerouslySetInnerHTML={{ __html: item.content }} />
                  {renderFiles(item.files)}
                </div>
              ))
            ) : Array.isArray(business.sales_channel.data) ? (
              business.sales_channel.data.map((item, index) => (
                <div key={index} className={styles.pTag} style={{ paddingLeft: "0", paddingRight: "0" }}>
                  {item.label_name && <strong className={styles.strong}>{item.label_name}</strong>}
                  <div className={styles.businessModal} dangerouslySetInnerHTML={{ __html: item.content }} />
                  {renderFiles(item.files)}
                </div>
              ))
            ) : business.sales_channel.data?.content ? (
              <div>
                <div className={styles.businessModal} dangerouslySetInnerHTML={{ __html: business.sales_channel.data.content }} />
                {renderFiles(business.sales_channel.data.files)}
              </div>
            ) : null}
            {renderFiles(business.sales_channel.files)}
          </div>
        ) : null}
      </Dropdown>
    );
  }

  if (business?.clients?.status && Array.isArray(business.clients.data) && business.clients.data.length > 0) {
    activeSections.push(
      <Dropdown
        key="clients"
        title="Clients"
        isOpen={openStates["Clients"]}
        onToggle={toggleDropdown}
        isPrivateDeal={isPrivateDeal}
      >
        <div className={styles.clients}>
          {business?.clients.data.map((client, index) => {
            const file = client.uploadedFileData;
            const imagePath = file?.path?.replace("public", "");
            const isImage = file?.mimeType?.startsWith("image/");
            const imageUrl = isImage
              ? `${process.env.NEXT_PUBLIC_USER_BASE}admin/${imagePath}`
              : "/fallbackImages.png";

            const altText = `${client.name || "Client"} - ${companyName}`;

            return (
              <div key={index} className={styles.clientcardwrap}>
                <SafeImage
                  src={imageUrl}
                  alt={altText}
                  className={styles.clientcardImage}
                />
                <div className={styles.clientName}>{client.name}</div>
              </div>
            );
          })}
        </div>
      </Dropdown>
    );
  }

  if (hasNodeData(business?.key_risk_factors)) {
    activeSections.push(
      <Dropdown
        key="key_risk_factors"
        title={keyRiskFactorsTitle}
        isOpen={openStates[keyRiskFactorsTitle]}
        onToggle={toggleDropdown}
        isPrivateDeal={isPrivateDeal}
      >
        {business.key_risk_factors ? (
          <div className={styles.pTag}>
            {typeof business.key_risk_factors.data === "string" ? (
              <div
                className={styles.businessModal}
                dangerouslySetInnerHTML={{ __html: business.key_risk_factors.data }}
              />
            ) : Array.isArray(business.key_risk_factors.data?.data) ? (
              business.key_risk_factors.data.data.map((item, index) => (
                <div key={index} className={styles.pTag} style={{ paddingLeft: "0", paddingRight: "0" }}>
                  {item.label_name && <strong className={styles.strong}>{item.label_name}</strong>}
                  <div className={styles.businessModal} dangerouslySetInnerHTML={{ __html: item.content }} />
                  {renderFiles(item.files)}
                </div>
              ))
            ) : Array.isArray(business.key_risk_factors.data) ? (
              business.key_risk_factors.data.some((item) => item?.factor_name) ? (
                <div className={styles.riskFactorsContainer}>
                  {business.key_risk_factors.data.map((item, index) => {
                    const riskLevel = (item.risk_level || "").toLowerCase();
                    let badgeClass = styles.badgeMedium;
                    if (riskLevel === "high") badgeClass = styles.badgeHigh;
                    else if (riskLevel === "low") badgeClass = styles.badgeLow;

                    return (
                      <div key={index} className={styles.riskItem}>
                        <div className={styles.riskHeader}>
                          <div className={styles.riskTitleGroup}>
                            <span className={styles.riskDot} />
                            <span className={styles.riskTitle}>
                              {item.factor_name}
                            </span>
                          </div>
                          {item.risk_level && (
                            <span className={`${styles.riskBadge} ${badgeClass}`}>
                              {item.risk_level}
                            </span>
                          )}
                        </div>
                        {item.factor_description && (
                          <div className={styles.riskDescription}>
                            {item.factor_description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                business.key_risk_factors.data.map((item, index) => (
                  <div key={index} className={styles.pTag} style={{ paddingLeft: "0", paddingRight: "0" }}>
                    {item.label_name && <strong className={styles.strong}>{item.label_name}</strong>}
                    <div className={styles.businessModal} dangerouslySetInnerHTML={{ __html: item.content }} />
                    {renderFiles(item.files)}
                  </div>
                ))
              )
            ) : business.key_risk_factors.data?.content ? (
              <div>
                <div className={styles.businessModal} dangerouslySetInnerHTML={{ __html: business.key_risk_factors.data.content }} />
                {renderFiles(business.key_risk_factors.data.files)}
              </div>
            ) : null}
            {renderFiles(business.key_risk_factors.files)}
            <p className={styles.pastPerformanceDisclaimer}>
              * Past performance is not an indicator or guarantee of future returns.
            </p>
          </div>
        ) : null}
      </Dropdown>
    );
  }

  if (activeSections.length === 0) return null;

  return (
    <div
      className={`${styles.container} ${
        isPrivateDeal ? styles.privateDeal : ""
      }`}
    >
      {activeSections.map((section, index) => (
        <React.Fragment key={index}>
          {section}
          {index < activeSections.length - 1 && <hr className={styles.hr} />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Business;
