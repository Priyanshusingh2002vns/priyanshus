"use client";
import React, { useState, useRef, useEffect } from "react";

const BankSelect = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const [customBank, setCustomBank] = useState("");
  const selectRef = useRef(null);

  const banks = ["HDFC", "ICICI", "SBI", "AXIS", "PNB", "OTHER"];

  useEffect(() => {
    if (!value) return;

    if (banks.includes(value)) {
      setSelectedBank(value);
      setCustomBank("");
    } else {
      setSelectedBank("OTHER");
      setCustomBank(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (bank) => {
    setSelectedBank(bank);
    setOpen(false);

    if (bank === "OTHER") {
      setCustomBank("");
      onChange && onChange("");
    } else {
      onChange && onChange(bank);
    }
  };

  const handleCustomBankChange = (e) => {
    const val = e.target.value;
    setCustomBank(val);
    onChange && onChange(val);
  };

  return (
    <div className="relative w-full" ref={selectRef}>
      <label className="block text-sm text-gray-400 mb-1">Bank</label>

      {selectedBank === "OTHER" ? (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter bank name"
            value={customBank}
            onChange={handleCustomBankChange}
            className="w-full input_field"
          />
          {/* <button
            type="button"
            onClick={() => {
              setSelectedBank("");
              setCustomBank("");
              onChange && onChange("");
            }}
            className="text-sm text-secondary underline"
          >
            Change
          </button> */}
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="button_select"
          >
            <span>{selectedBank || "Select Bank"}</span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {open && (
            <ul className="absolute_position z-10 w-full mt-2 bg-dark border border-secondary p-0 m-0 rounded shadow">
              {banks.map((bank) => (
                <li
                  key={bank}
                  onClick={() => handleSelect(bank)}
                  className={`px-4 py-2 cursor-pointer hover:bg-secondary ${
                    selectedBank === bank
                      ? "bg-secondary text-white"
                      : "text-light"
                  }`}
                >
                  {bank === "OTHER" ? "Other (Enter manually)" : bank}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <input
        type="hidden"
        name="bank"
        value={selectedBank === "OTHER" ? customBank : selectedBank}
      />
    </div>
  );
};

export default BankSelect;
