import React, { useState, useEffect } from "react";
import ClaimForm from "./components/ClaimForm";
import ClaimsList from "./components/ClaimsList";
import { IClaim, ClaimType } from "../types/claim";
import "./styles/App.css";

export default function App() {
  const [claims, setClaims] = useState<IClaim[]>([]);
  const [showForm, setShowForm] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_BASE_URL = window.location.origin;

  // Fetch all claims
  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/claims`);
      const data = await response.json();
      if (data.success) {
        setClaims(data.data);
      }
    } catch (err) {
      setError("Failed to fetch claims");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmitClaim = async (formData: {
    claimantName: string;
    policyNumber: string;
    claimType: ClaimType;
    claimAmount: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`${API_BASE_URL}/api/claims`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Claim created successfully! ID: ${data.data.claimId}`);
        setClaims([...claims, data.data]);
        setShowForm(false);
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(data.error || "Failed to create claim");
      }
    } catch (err) {
      setError("Error submitting claim");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update claim status
  const handleUpdateStatus = async (claimId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/claims/${claimId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setClaims(
          claims.map((claim) =>
            claim.claimId === claimId ? data.data : claim
          )
        );
        setSuccess(`Claim ${claimId} updated successfully!`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || "Failed to update claim");
      }
    } catch (err) {
      setError("Error updating claim");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>📋 Claim Management System</h1>
          <p>Manage your insurance claims efficiently</p>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="app-content">
        <div className="sidebar">
          <button
            className={`sidebar-btn ${showForm ? "active" : ""}`}
            onClick={() => setShowForm(true)}
          >
            ➕ New Claim
          </button>
          <button
            className={`sidebar-btn ${!showForm ? "active" : ""}`}
            onClick={() => setShowForm(false)}
          >
            📊 View Claims
          </button>
        </div>

        <main className="main-content">
          {showForm ? (
            <ClaimForm
              onSubmit={handleSubmitClaim}
              isLoading={loading}
            />
          ) : (
            <ClaimsList
              claims={claims}
              onUpdateStatus={handleUpdateStatus}
              isLoading={loading}
              onRefresh={fetchClaims}
            />
          )}
        </main>
      </div>
    </div>
  );
}
