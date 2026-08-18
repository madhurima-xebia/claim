import React, { useState, useEffect } from "react";
import { ClaimStatus } from "../../types/claim";
import "../styles/AdminDashboard.css";

interface DashboardStats {
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  closedClaims: number;
  totalClaimAmount: number;
  approvedAmount: number;
  claimsByType: {
    auto: number;
    property: number;
    health: number;
  };
}

interface Claim {
  claimId: string;
  claimantName: string;
  policyNumber: string;
  claimType: string;
  claimAmount: number;
  status: ClaimStatus;
  approvedBy?: string;
  rejectionReason?: string;
  adjustedAmount?: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
}

export default function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [showRejectForm, setShowRejectForm] = useState<Record<string, boolean>>({});
  const [adjustAmount, setAdjustAmount] = useState<Record<string, string>>({});
  const [showAdjustForm, setShowAdjustForm] = useState<Record<string, boolean>>({});

  const API_BASE_URL = window.location.origin;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Fetch dashboard stats
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Fetch all claims
  useEffect(() => {
    fetchClaims();
  }, []);

  // Filter claims when status changes
  useEffect(() => {
    if (selectedStatus === "all") {
      setFilteredClaims(claims);
    } else {
      setFilteredClaims(claims.filter((c) => c.status === selectedStatus));
    }
  }, [selectedStatus, claims]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, { headers });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || "Failed to load dashboard stats");
      }
    } catch (err) {
      setError("Network error loading dashboard stats");
      console.error(err);
    }
  };

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/claims`, { headers });
      const data = await response.json();
      if (data.success) {
        setClaims(data.data);
      } else {
        setError(data.error || "Failed to load claims");
      }
    } catch (err) {
      setError("Network error loading claims");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClaim = async (claimId: string) => {
    setActionLoading({ ...actionLoading, [claimId]: true });
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/claims/${claimId}/approve`,
        {
          method: "PUT",
          headers,
        }
      );
      const data = await response.json();
      if (data.success) {
        await fetchClaims();
        await fetchDashboardStats();
      } else {
        setError(data.error || "Failed to approve claim");
      }
    } catch (err) {
      setError("Network error approving claim");
      console.error(err);
    } finally {
      setActionLoading({ ...actionLoading, [claimId]: false });
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    if (!rejectReason[claimId]) {
      setError("Please provide a rejection reason");
      return;
    }

    setActionLoading({ ...actionLoading, [claimId]: true });
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/claims/${claimId}/reject`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ rejectionReason: rejectReason[claimId] }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setRejectReason({ ...rejectReason, [claimId]: "" });
        setShowRejectForm({ ...showRejectForm, [claimId]: false });
        await fetchClaims();
        await fetchDashboardStats();
      } else {
        setError(data.error || "Failed to reject claim");
      }
    } catch (err) {
      setError("Network error rejecting claim");
      console.error(err);
    } finally {
      setActionLoading({ ...actionLoading, [claimId]: false });
    }
  };

  const handleAdjustClaim = async (claimId: string) => {
    if (!adjustAmount[claimId]) {
      setError("Please provide an adjusted amount");
      return;
    }

    const amount = parseFloat(adjustAmount[claimId]);
    if (isNaN(amount) || amount <= 0) {
      setError("Adjusted amount must be a positive number");
      return;
    }

    setActionLoading({ ...actionLoading, [claimId]: true });
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/claims/${claimId}/adjust`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ adjustedAmount: amount }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setAdjustAmount({ ...adjustAmount, [claimId]: "" });
        setShowAdjustForm({ ...showAdjustForm, [claimId]: false });
        await fetchClaims();
        await fetchDashboardStats();
      } else {
        setError(data.error || "Failed to adjust claim");
      }
    } catch (err) {
      setError("Network error adjusting claim");
      console.error(err);
    } finally {
      setActionLoading({ ...actionLoading, [claimId]: false });
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Claims</h3>
            <p className="stat-value">{stats.totalClaims}</p>
          </div>

          <div className="stat-card pending">
            <h3>Pending</h3>
            <p className="stat-value">{stats.pendingClaims}</p>
          </div>

          <div className="stat-card approved">
            <h3>Approved</h3>
            <p className="stat-value">{stats.approvedClaims}</p>
          </div>

          <div className="stat-card rejected">
            <h3>Rejected</h3>
            <p className="stat-value">{stats.rejectedClaims}</p>
          </div>

          <div className="stat-card closed">
            <h3>Closed</h3>
            <p className="stat-value">{stats.closedClaims}</p>
          </div>

          <div className="stat-card amount">
            <h3>Total Amount</h3>
            <p className="stat-value">${stats.totalClaimAmount.toFixed(2)}</p>
          </div>

          <div className="stat-card approved-amount">
            <h3>Approved Amount</h3>
            <p className="stat-value">${stats.approvedAmount.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Claims by Type */}
      {stats && (
        <div className="claims-by-type">
          <h3>Claims by Type</h3>
          <div className="type-cards">
            <div className="type-card">
              <span>Auto</span>
              <strong>{stats.claimsByType.auto}</strong>
            </div>
            <div className="type-card">
              <span>Property</span>
              <strong>{stats.claimsByType.property}</strong>
            </div>
            <div className="type-card">
              <span>Health</span>
              <strong>{stats.claimsByType.health}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Claims List */}
      <div className="claims-section">
        <h2>Claims Management</h2>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${selectedStatus === "all" ? "active" : ""}`}
            onClick={() => setSelectedStatus("all")}
          >
            All ({claims.length})
          </button>
          <button
            className={`filter-btn ${selectedStatus === ClaimStatus.PENDING ? "active" : ""}`}
            onClick={() => setSelectedStatus(ClaimStatus.PENDING)}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${selectedStatus === ClaimStatus.APPROVED ? "active" : ""}`}
            onClick={() => setSelectedStatus(ClaimStatus.APPROVED)}
          >
            Approved
          </button>
          <button
            className={`filter-btn ${selectedStatus === ClaimStatus.REJECTED ? "active" : ""}`}
            onClick={() => setSelectedStatus(ClaimStatus.REJECTED)}
          >
            Rejected
          </button>
        </div>

        {loading ? (
          <p>Loading claims...</p>
        ) : filteredClaims.length === 0 ? (
          <p className="no-claims">No claims found</p>
        ) : (
          <div className="claims-table">
            <table>
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Claimant</th>
                  <th>Policy</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((claim) => (
                  <tr key={claim.claimId}>
                    <td>{claim.claimId}</td>
                    <td>{claim.claimantName}</td>
                    <td>{claim.policyNumber}</td>
                    <td>{claim.claimType}</td>
                    <td>${claim.adjustedAmount || claim.claimAmount}</td>
                    <td>
                      <span className={`status-badge ${claim.status.toLowerCase()}`}>
                        {claim.status}
                      </span>
                    </td>
                    <td>{new Date(claim.createdAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      {claim.status === ClaimStatus.PENDING && (
                        <>
                          <button
                            onClick={() => handleApproveClaim(claim.claimId)}
                            disabled={actionLoading[claim.claimId]}
                            className="action-btn approve-btn"
                          >
                            {actionLoading[claim.claimId] ? "..." : "Approve"}
                          </button>

                          {showRejectForm[claim.claimId] ? (
                            <div className="inline-form">
                              <input
                                type="text"
                                placeholder="Rejection reason"
                                value={rejectReason[claim.claimId] || ""}
                                onChange={(e) =>
                                  setRejectReason({
                                    ...rejectReason,
                                    [claim.claimId]: e.target.value,
                                  })
                                }
                              />
                              <button
                                onClick={() => handleRejectClaim(claim.claimId)}
                                disabled={actionLoading[claim.claimId]}
                                className="action-btn confirm-btn"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() =>
                                  setShowRejectForm({
                                    ...showRejectForm,
                                    [claim.claimId]: false,
                                  })
                                }
                                className="action-btn cancel-btn"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                setShowRejectForm({
                                  ...showRejectForm,
                                  [claim.claimId]: true,
                                })
                              }
                              className="action-btn reject-btn"
                            >
                              Reject
                            </button>
                          )}

                          {showAdjustForm[claim.claimId] ? (
                            <div className="inline-form">
                              <input
                                type="number"
                                placeholder="New amount"
                                value={adjustAmount[claim.claimId] || ""}
                                onChange={(e) =>
                                  setAdjustAmount({
                                    ...adjustAmount,
                                    [claim.claimId]: e.target.value,
                                  })
                                }
                              />
                              <button
                                onClick={() => handleAdjustClaim(claim.claimId)}
                                disabled={actionLoading[claim.claimId]}
                                className="action-btn confirm-btn"
                              >
                                Adjust
                              </button>
                              <button
                                onClick={() =>
                                  setShowAdjustForm({
                                    ...showAdjustForm,
                                    [claim.claimId]: false,
                                  })
                                }
                                className="action-btn cancel-btn"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                setShowAdjustForm({
                                  ...showAdjustForm,
                                  [claim.claimId]: true,
                                })
                              }
                              className="action-btn adjust-btn"
                            >
                              Adjust
                            </button>
                          )}
                        </>
                      )}
                      {claim.status !== ClaimStatus.PENDING && (
                        <span className="no-action">No actions available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
