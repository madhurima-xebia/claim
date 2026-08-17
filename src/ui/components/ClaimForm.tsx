import React, { useState } from "react";
import { ClaimType } from "../../types/claim";
import "../styles/ClaimForm.css";

interface ClaimFormProps {
  onSubmit: (data: {
    claimantName: string;
    policyNumber: string;
    claimType: ClaimType;
    claimAmount: number;
  }) => void;
  isLoading: boolean;
}

export default function ClaimForm({ onSubmit, isLoading }: ClaimFormProps) {
  const [formData, setFormData] = useState({
    claimantName: "",
    policyNumber: "",
    claimType: ClaimType.AUTO,
    claimAmount: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.claimantName.trim()) {
      newErrors.claimantName = "Claimant name is required";
    } else if (formData.claimantName.trim().length < 2) {
      newErrors.claimantName = "Name must be at least 2 characters";
    }

    if (!formData.policyNumber.trim()) {
      newErrors.policyNumber = "Policy number is required";
    }

    if (!formData.claimAmount) {
      newErrors.claimAmount = "Claim amount is required";
    } else if (parseFloat(formData.claimAmount) <= 0) {
      newErrors.claimAmount = "Claim amount must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "claimAmount" ? value : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      claimantName: formData.claimantName.trim(),
      policyNumber: formData.policyNumber.trim(),
      claimType: formData.claimType,
      claimAmount: parseFloat(formData.claimAmount),
    });

    // Reset form
    setFormData({
      claimantName: "",
      policyNumber: "",
      claimType: ClaimType.AUTO,
      claimAmount: "",
    });
  };

  return (
    <div className="claim-form-container">
      <div className="form-card">
        <h2 className="form-title">Submit New Claim</h2>

        <form onSubmit={handleSubmit} className="claim-form">
          <div className="form-group">
            <label htmlFor="claimantName" className="form-label">
              Claimant Name
            </label>
            <input
              type="text"
              id="claimantName"
              name="claimantName"
              value={formData.claimantName}
              onChange={handleChange}
              placeholder="Enter full name"
              className={`form-input ${errors.claimantName ? "error" : ""}`}
              disabled={isLoading}
            />
            {errors.claimantName && (
              <span className="error-message">{errors.claimantName}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="policyNumber" className="form-label">
                Policy Number
              </label>
              <input
                type="text"
                id="policyNumber"
                name="policyNumber"
                value={formData.policyNumber}
                onChange={handleChange}
                placeholder="e.g., POL-2024-001"
                className={`form-input ${errors.policyNumber ? "error" : ""}`}
                disabled={isLoading}
              />
              {errors.policyNumber && (
                <span className="error-message">{errors.policyNumber}</span>
              )}
            </div>

            <div className="form-group flex-1">
              <label htmlFor="claimType" className="form-label">
                Claim Type
              </label>
              <select
                id="claimType"
                name="claimType"
                value={formData.claimType}
                onChange={handleChange}
                className="form-select"
                disabled={isLoading}
              >
                <option value={ClaimType.AUTO}>Auto</option>
                <option value={ClaimType.PROPERTY}>Property</option>
                <option value={ClaimType.HEALTH}>Health</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="claimAmount" className="form-label">
              Claim Amount (₹)
            </label>
            <input
              type="number"
              id="claimAmount"
              name="claimAmount"
              value={formData.claimAmount}
              onChange={handleChange}
              placeholder="Enter amount"
              className={`form-input ${errors.claimAmount ? "error" : ""}`}
              disabled={isLoading}
              min="0"
              step="0.01"
            />
            {errors.claimAmount && (
              <span className="error-message">{errors.claimAmount}</span>
            )}
          </div>

          <button
            type="submit"
            className={`submit-btn ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Submitting...
              </>
            ) : (
              "Submit Claim"
            )}
          </button>
        </form>
      </div>

      <div className="info-card">
        <h3>📝 How it works</h3>
        <ul className="info-list">
          <li>Fill in your claim details accurately</li>
          <li>Select the appropriate claim type</li>
          <li>Enter the claim amount in rupees</li>
          <li>Submit and track your claim status</li>
        </ul>
      </div>
    </div>
  );
}
