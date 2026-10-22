import React, { useState, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import { X } from "lucide-react";
import styles from "./FilterPopup.module.css";
import Image from "next/image";

const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Dual Slider Component moved outside to prevent React from unmounting it
const DualSlider = ({ values, setValues, minVal = 0, maxVal = 10, formatLabel }) => {
    const trackRef = useRef(null);
    const isDraggingRef = useRef(false);
    const activeHandleRef = useRef(null);

    const [activeThumb, setActiveThumb] = useState(null);

    const range = maxVal - minVal || 1; // Prevent division by zero

    const valuesRef = useRef(values);
    useEffect(() => {
        valuesRef.current = values;
    }, [values]);

    const handlePointerMove = (e) => {
        if (!isDraggingRef.current || !trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        const step = range > 1000 ? 50 : (range > 100 ? 5 : 0.5);
        let val = Math.round((percent * range + minVal) / step) * step;

        const currentVals = valuesRef.current;
        if (activeHandleRef.current === "min") {
            setValues([Math.min(val, currentVals[1]), currentVals[1]]);
        } else if (activeHandleRef.current === "max") {
            setValues([currentVals[0], Math.max(val, currentVals[0])]);
        }
    };

    const handlePointerUp = () => {
        isDraggingRef.current = false;
        activeHandleRef.current = null;
        setActiveThumb(null);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
    };

    const handlePointerDown = (e, handle) => {
        e.stopPropagation();
        e.preventDefault();
        isDraggingRef.current = true;
        activeHandleRef.current = handle;
        setActiveThumb(handle);

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);
    };

    useEffect(() => {
        return () => handlePointerUp();
    }, []);

    const handleTrackClick = (e) => {
        if (!trackRef.current || isDraggingRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        const step = range > 1000 ? 50 : (range > 100 ? 5 : 0.5);
        let val = Math.round((percent * range + minVal) / step) * step;

        if (Math.abs(val - values[0]) <= Math.abs(val - values[1])) {
            setValues([val, values[1]]);
        } else {
            setValues([values[0], val]);
        }
    };

    const safeMin = Math.max(minVal, Math.min(maxVal, values[0] ?? minVal));
    const safeMax = Math.max(minVal, Math.min(maxVal, values[1] ?? maxVal));
    const leftPercent = Math.max(0, Math.min(100, ((safeMin - minVal) / range) * 100));
    const widthPercent = Math.max(0, Math.min(100 - leftPercent, ((safeMax - safeMin) / range) * 100));

    return (
        <div style={{ touchAction: 'none' }}>
            <div className={styles.sliderMinMax}>
                {formatLabel(safeMin, safeMax)}
            </div>
            <div className={styles.sliderTrack} ref={trackRef} onClick={handleTrackClick}>
                <div
                    className={styles.sliderSelected}
                    style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                />
                <div
                    className={styles.sliderThumb}
                    style={{ left: `${leftPercent}%`, zIndex: activeThumb === 'min' ? 10 : 2 }}
                    onPointerDown={(e) => handlePointerDown(e, 'min')}
                />
                <div
                    className={styles.sliderThumb}
                    style={{ left: `${leftPercent + widthPercent}%`, zIndex: activeThumb === 'max' ? 10 : 2 }}
                    onPointerDown={(e) => handlePointerDown(e, 'max')}
                />
            </div>
            <div className={styles.sliderLabels}>
                <span>₹{formatNumberWithCommas(minVal)} Cr</span>
                <span>₹{formatNumberWithCommas(Math.round(minVal + range * 0.33))} Cr</span>
                <span>₹{formatNumberWithCommas(Math.round(minVal + range * 0.66))} Cr</span>
                <span>₹{formatNumberWithCommas(maxVal)} Cr+</span>
            </div>
        </div>
    );
};

const FilterPopup = ({ 
    show, 
    onHide, 
    onApply, 
    availableStages = [], 
    ticketSizeRange = { min: 0, max: 10000, ranges: [], options: [] },
    revenueRange = { min: 0, max: 10000, ranges: [], options: [] },
    valuationRange: valuationRangeProp = { min: 0, max: 20000, ranges: [], options: [] },
    availableFundingStatus = [],
    availableActivities = [],
    availableParticipations = [],
    availableSectors = [],
    initialFilters = null 
}) => {
    // Ticket size min, max, ranges
    const effectiveTicketSize = ticketSizeRange?.ranges?.length || typeof ticketSizeRange?.min === 'number'
        ? ticketSizeRange
        : revenueRange;
    const ticketMin = effectiveTicketSize?.min ?? 0;
    const ticketMax = effectiveTicketSize?.max ?? 10000;
    const ticketRanges = effectiveTicketSize?.ranges ?? [];

    // Valuation range min, max, ranges
    const valMin = valuationRangeProp?.min ?? 0;
    const valMax = valuationRangeProp?.max ?? 20000;
    const valRanges = valuationRangeProp?.ranges ?? [];

    // State for all filters
    const [dealStages, setDealStages] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [searchSector, setSearchSector] = useState("");
    const [dealRatings, setDealRatings] = useState([]);
    const [ticketSize, setTicketSize] = useState([ticketMin, ticketMax]); // In Cr
    const [fundingStatus, setFundingStatus] = useState([]);
    const [valuationRange, setValuationRange] = useState([valMin, valMax]); // In Cr
    const [activities, setActivities] = useState([]);
    const [participation, setParticipation] = useState([]);

    // Keep ticketSize and valuationRange synced with min/max if no initialFilters
    useEffect(() => {
        if (!initialFilters?.ticketSize) {
            setTicketSize([ticketMin, ticketMax]);
        }
    }, [ticketMin, ticketMax]);

    useEffect(() => {
        if (!initialFilters?.valuationRange) {
            setValuationRange([valMin, valMax]);
        }
    }, [valMin, valMax]);

    // Synchronize local state with active filters when modal opens
    useEffect(() => {
        if (show) {
            if (initialFilters) {
                setDealStages(initialFilters.dealStages || []);
                setSectors(initialFilters.sectors || []);
                setDealRatings(initialFilters.dealRatings || []);
                setTicketSize(initialFilters.ticketSize || [ticketMin, ticketMax]);
                setFundingStatus(initialFilters.fundingStatus || []);
                setValuationRange(initialFilters.valuationRange || [valMin, valMax]);
                setActivities(initialFilters.activities || []);
                setParticipation(initialFilters.participation || []);
            } else {
                setDealStages([]);
                setSectors([]);
                setSearchSector("");
                setDealRatings([]);
                setTicketSize([ticketMin, ticketMax]);
                setFundingStatus([]);
                setValuationRange([valMin, valMax]);
                setActivities([]);
                setParticipation([]);
            }
        }
    }, [show, initialFilters, ticketMin, ticketMax, valMin, valMax]);

    const toggleArrayItem = (array, setArray, item) => {
        if (array.includes(item)) {
            setArray(array.filter((i) => i !== item));
        } else {
            setArray([...array, item]);
        }
    };

    const handleClearAll = () => {
        setDealStages([]);
        setSectors([]);
        setSearchSector("");
        setDealRatings([]);
        setTicketSize([ticketMin, ticketMax]);
        setFundingStatus([]);
        setValuationRange([valMin, valMax]);
        setActivities([]);
        setParticipation([]);
    };

    const handleResetAndApply = () => {
        handleClearAll();
        onApply(null); // Passing null clears filters in AllDeals.jsx
        onHide();
    };

    const handleApply = () => {
        const filters = {};

        if (dealStages.length > 0) filters.dealStages = dealStages;
        if (sectors.length > 0) filters.sectors = sectors;
        if (dealRatings.length > 0) filters.dealRatings = dealRatings;
        if (fundingStatus.length > 0) filters.fundingStatus = fundingStatus;
        if (activities.length > 0) filters.activities = activities;
        if (participation.length > 0) filters.participation = participation;

        // Only include range filters if they've been moved from default
        if (ticketSize[0] !== ticketMin || ticketSize[1] !== ticketMax) {
            filters.ticketSize = ticketSize;
        }
        if (valuationRange[0] !== valMin || valuationRange[1] !== valMax) {
            filters.valuationRange = valuationRange;
        }

        const hasFilters = Object.keys(filters).length > 0;
        onApply(hasFilters ? filters : null);
        onHide();
    };

    const Checkbox = ({ label, checked, onChange }) => (
        <label className={styles.checkboxLabel}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className={styles.checkboxInput}
            />
            <div className={styles.customCheckbox}>
                {checked && <img src="/tickCheckbox.svg" alt="tick" className={styles.tickIcon} />}
            </div>
            <span className={styles.checkboxLabelText}>{label}</span>
        </label>
    );

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            dialogClassName={styles.modalDialog}
            contentClassName={styles.modalContent}
            backdrop="static"
        >
            <div className={styles.modalHeader}>
                <h2 className={styles.title}>Filters</h2>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <button onClick={handleClearAll} className={styles.clearAllBtn}>
                        Clear All
                    </button>
                    <X size={24} color="#4A5565" cursor="pointer" onClick={onHide} />
                </div>
            </div>

            <div className={styles.modalBody}>
                {/* 1. Deal Stage */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Deal Stage</h3>
                    <div className={styles.checkboxContainer}>
                        {(() => {
                            const defaultStages = ["IPO – SME", "IPO – Mainboard", "Pre-IPO – SME", "Pre-IPO – Mainboard"];
                            const stageList = availableStages.length > 0 ? availableStages : defaultStages;
                            const uniqueStages = Array.from(new Set(stageList.map(s => String(s).trim()).filter(Boolean)));
                            return uniqueStages.map(lbl => (
                                <Checkbox
                                    key={lbl}
                                    label={lbl}
                                    checked={dealStages.includes(lbl)}
                                    onChange={() => toggleArrayItem(dealStages, setDealStages, lbl)}
                                />
                            ));
                        })()}
                    </div>
                </div>

                {/* 2. Sector / Industry */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Sector / Industry</h3>
                    <div className={styles.searchInputWrapper}>
                        <input
                            type="text"
                            placeholder="Search sectors..."
                            value={searchSector}
                            onChange={(e) => setSearchSector(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <div className={styles.checkboxContainerThreeCols}>
                        {availableSectors
                            .filter(s => s && String(s).toLowerCase().includes(searchSector.toLowerCase()))
                            .map(lbl => (
                                <Checkbox
                                    key={lbl}
                                    label={lbl}
                                    checked={sectors.includes(lbl)}
                                    onChange={() => toggleArrayItem(sectors, setSectors, lbl)}
                                />
                            ))}
                    </div>
                </div>

                {/* 3. Deal Rating */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Deal Rating</h3>
                    <div className={styles.pillGroup}>
                        {[
                            { label: "4.5 & above", value: "4.5+" },
                            { label: "4.0 – 4.5", value: "4.0 - 4.5" },
                            { label: "Below 4.0", value: "Below 4.0" }
                        ].map(opt => {
                            const isActive = dealRatings.includes(opt.value) ||
                                dealRatings.includes(opt.label) ||
                                (opt.value === "4.5+" && (dealRatings.includes("4.5 & above") || dealRatings.includes("4.5 and above"))) ||
                                (opt.value === "4.0 - 4.5" && dealRatings.includes("4.0 – 4.5"));
                            return (
                                <div
                                    key={opt.value}
                                    className={`${styles.pillBtn} ${isActive ? styles.pillBtnActive : ''}`}
                                    onClick={() => {
                                        if (isActive) {
                                            setDealRatings(dealRatings.filter(r => 
                                                r !== opt.value && 
                                                r !== opt.label && 
                                                !(opt.value === "4.5+" && (r === "4.5 & above" || r === "4.5 and above")) &&
                                                !(opt.value === "4.0 - 4.5" && r === "4.0 – 4.5")
                                            ));
                                        } else {
                                            setDealRatings([...dealRatings, opt.value]);
                                        }
                                    }}
                                >
                                    {isActive ? (
                                        <img src="/starwhite.svg" className={styles.activeStar} alt="star" />
                                    ) : (
                                        <div className={styles.inactiveStar} aria-label="star" />
                                    )}
                                    <p className={styles.pillLabel}>{opt.label}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 4. Ticket Size / Allocation */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Ticket Size / Allocation</h3>
                    <DualSlider
                        values={ticketSize}
                        setValues={setTicketSize}
                        minVal={ticketMin}
                        maxVal={ticketMax}
                        formatLabel={(min, max) => `₹${formatNumberWithCommas(min)} Cr – ₹${formatNumberWithCommas(max)} Cr`}
                    />
                </div>

                {/* 5. Funding Status */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Funding Status</h3>
                    <div className={styles.checkboxContainer}>
                        {(() => {
                            const defaultFunding = ["< 50%", "50% - 80%", "80%+"];
                            const fundingList = availableFundingStatus && availableFundingStatus.length > 0
                                ? availableFundingStatus
                                : defaultFunding;
                            const uniqueFunding = Array.from(new Set(fundingList.map(f => String(f).trim()).filter(Boolean)));
                            return uniqueFunding.map(val => {
                                const isChecked = fundingStatus.includes(val) ||
                                    fundingStatus.includes(`${val} Funded`) ||
                                    fundingStatus.some(s => s.replace(/\s*Funded/i, '').replace(/–/g, '-').trim() === val.replace(/–/g, '-').trim());
                                const displayLabel = val.includes("%") && !val.toLowerCase().includes("funded") ? `${val} Funded` : val;
                                return (
                                    <Checkbox
                                        key={val}
                                        label={displayLabel}
                                        checked={isChecked}
                                        onChange={() => toggleArrayItem(fundingStatus, setFundingStatus, val)}
                                    />
                                );
                            });
                        })()}
                    </div>
                </div>

                {/* 6. Valuation Range */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Valuation Range</h3>
                    <DualSlider
                        values={valuationRange}
                        setValues={setValuationRange}
                        minVal={valMin}
                        maxVal={valMax}
                        formatLabel={(min, max) => `₹${formatNumberWithCommas(min)} Cr – ₹${formatNumberWithCommas(max)} Cr`}
                    />
                </div>

                {/* 7. Activity & Freshness */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Activity & Freshness</h3>
                    <div className={styles.pillGroup}>
                        {(() => {
                            const defaultActivities = ["New Deals", "Trending Deals", "Most Viewed", "Recently Updated", "Closing Soon"];
                            const activityList = availableActivities.length > 0 ? availableActivities : defaultActivities;
                            const uniqueActivities = Array.from(new Set(activityList.map(a => String(a).trim()).filter(Boolean)));
                            return uniqueActivities.map(lbl => (
                                <div
                                    key={lbl}
                                    className={`${styles.pillBtn} ${activities.includes(lbl) ? styles.pillBtnActive : ''}`}
                                    onClick={() => toggleArrayItem(activities, setActivities, lbl)}
                                >
                                    <p className={styles.pillLabel}>{lbl}</p>
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                {/* 8. Participation & Validation */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Participation & Validation</h3>
                    <div className={styles.checkboxContainer}>
                        {(() => {
                            const defaultParticipations = [
                                "Merchant Banker Appointed",
                                "Anchor / Strategic Investors",
                                "Institutional / Fund Participation",
                                "Strong Promoter Background"
                            ];
                            const participationList = availableParticipations.length > 0 ? availableParticipations : defaultParticipations;
                            const uniqueParticipations = Array.from(new Set(participationList.map(p => String(p).trim()).filter(Boolean)));
                            return uniqueParticipations.map(lbl => (
                                <Checkbox
                                    key={lbl}
                                    label={lbl}
                                    checked={participation.includes(lbl)}
                                    onChange={() => toggleArrayItem(participation, setParticipation, lbl)}
                                />
                            ));
                        })()}
                    </div>
                </div>

            </div>

            <div className={styles.modalFooter}>
                <button className={styles.btnReset} onClick={handleResetAndApply}>
                    Reset
                </button>
                <button className={styles.btnApply} onClick={handleApply}>
                    Apply Filters
                </button>
            </div>
        </Modal>
    );
};

export default FilterPopup;
