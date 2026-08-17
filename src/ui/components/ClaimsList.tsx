import React, { useState } from "react";
import { IClaim, ClaimStatus } from "../../types/claim";
import "../styles/ClaimsList.css";

interface ClaimsListProps {
  claims: IClaim[];
  onUpdateStatus: (claimId: string, newStatus: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function ClaimsList({
  claims,
  onUpdateStatus,
  isLoading,
  onRefresh,
}: ClaimsListProps) {
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case ClaimStatus.INITIATED:
        return "badge badge-blue";
      case ClaimStatus.PENDING:
        return "badge badge-yellow";
      case ClaimStatus.APPROVED:
        return "badge badge-green";
      case ClaimStatus.REJECTED:
        return "badge badge-red";
      case ClaimStatus.CLOSED:
        return "badge badge-gray";
      default:
        return "badge badge-gray";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNextStatus = (currentStatus: string): string[] => {
    switch (currentStatus) {
      case ClaimStatus.INITIATED:
        return [ClaimStatus.PENDING];
      case ClaimStatus.PENDING:
        return [ClaimStatus.APPROVED, ClaimStatus.REJECTED];
      case ClaimStatus.APPROVED:
      case ClaimStatus.REJECTED:
        return [ClaimStatus.CLOSED];
      default:
        return [];
    }
  };

  return (
    <div className="claims-list-container">
      <div className="claims-header">
        <h2>My Claims</h2>
        <button
          className="refresh-btn"
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh claims list"
        >
          🔄 Refresh
        </button>
      </div>

      {claims.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No claims yet</h3>
          <p>Create your first claim to get started</p>
        </div>
      ) : (
        <div className="claims-grid">
          {claims.map((claim) => (
            <div
              key={claim.claimId}
              className={`claim-card ${expandedClaimId === claim.claimId ? "expanded" : ""}`}
            >
              <div className="claim-header">
                <div className="claim-id-section">
                  <span className="claim-id">{claim.claimId}</span>
                  <span className={getStatusBadgeClass(claim.status)}>
                    {claim.status}
                  </span>
                </div>
                <button
                  className="expand-btn"
                  onClick={() =>
                    setExpandedClaimId(
                      expandedClaimId === claim.claimId ? null : claim.claimId
                    )
                  }
                >
                  {expandedClaimId === claim.claimId ? "▼" : "▶"}
                </button>
              </div>

              <div className="claim-summary">
                <div className="summary-item">
                  <span className="label">Claimant:</span>
                  <span className="value">{claim.claimantName}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Amount:</span>
                  <span className="value amount">₹{claim.claimAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {expandedClaimId === claim.claimId && (
                <div className="claim-details">
                  <div className="details-section">
                    <div className="detail-row">
                      <span className="detail-label">Policy Number:</span>
                      <span className="detail-value">{claim.policyNumber}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Claim Type:</span>
                      <span className="detail-value">{claim.claimType}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Created:</span>
                      <span className="detail-value">
                        {formatDate(claim.createdAt.toString())}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Updated:</span>
                      <span className="detail-value">
                        {formatDate(claim.updatedAt.toString())}
                      </span>
                    </div>
                  </div>

                  {getNextStatus(claim.status).length > 0 && (
                    <div className="action-section">
                      <span className="action-label">Update Status:</span>
                      <div className="action-buttons">
                        {getNextStatus(claim.status).map((nextStatus) => (
                          <button
                            key={nextStatus}
                            className={`action-btn action-btn-${nextStatus.toLowerCase()}`}
                            onClick={() =>
                              onUpdateStatus(claim.claimId, nextStatus)
                            }
                          >
                            {nextStatus}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
