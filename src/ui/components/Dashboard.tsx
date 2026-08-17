import React, { useState, useMemo } from "react";
import { IClaim, ClaimStatus } from "../../types/claim";
import "../styles/Dashboard.css";

interface DashboardProps {
  claims: IClaim[];
  onUpdateStatus: (claimId: string, newStatus: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function Dashboard({
  claims,
  onUpdateStatus,
  isLoading,
  onRefresh,
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");

  // Calculate statistics
  const stats = useMemo(() => {
    const total = claims.length;
    const approved = claims.filter(c => c.status === ClaimStatus.APPROVED).length;
    const fraudged = 0; // Placeholder - would need fraud data
    const autoResolved = claims.filter(c => c.status === ClaimStatus.CLOSED).length;
    const avgResolution = total > 0 ? "100% instant" : "N/A";

    return { total, approved, fraudged, autoResolved, avgResolution };
  }, [claims]);

  // Filter claims
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesSearch =
        claim.claimantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.claimId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All Status" || claim.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [claims, searchTerm, statusFilter]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case ClaimStatus.APPROVED:
        return "status-approved";
      case ClaimStatus.REJECTED:
        return "status-rejected";
      case ClaimStatus.PENDING:
        return "status-pending";
      case ClaimStatus.INITIATED:
        return "status-initiated";
      case ClaimStatus.CLOSED:
        return "status-closed";
      default:
        return "status-default";
    }
  };

  const getPriorityBadge = (amount: number) => {
    if (amount >= 50000) return { level: "High", class: "priority-high" };
    if (amount >= 20000) return { level: "Medium", class: "priority-medium" };
    return { level: "Low", class: "priority-low" };
  };

  const getAiDecision = (status: string) => {
    switch (status) {
      case ClaimStatus.APPROVED:
        return "Approve";
      case ClaimStatus.REJECTED:
        return "Reject";
      default:
        return "Review";
    }
  };

  return (
    <div className="dashboard">
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">TOTAL CLAIMS</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">AVG RESOLUTION</div>
          <div className="stat-value highlight">{stats.avgResolution}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">FRAUD FLAGGED</div>
          <div className="stat-value alert-value">{stats.fraudged}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">AUTO-RESOLVED</div>
          <div className="stat-value">{stats.autoResolved}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filter-section">
        <input
          type="text"
          placeholder="Search claimant or policy..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option>All Status</option>
          <option>{ClaimStatus.INITIATED}</option>
          <option>{ClaimStatus.PENDING}</option>
          <option>{ClaimStatus.APPROVED}</option>
          <option>{ClaimStatus.REJECTED}</option>
          <option>{ClaimStatus.CLOSED}</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="filter-select"
        >
          <option>All Priority</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <button
          className="refresh-btn"
          onClick={onRefresh}
          disabled={isLoading}
        >
          🔄
        </button>
      </div>

      {/* Claims Table */}
      <div className="table-container">
        {filteredClaims.length === 0 ? (
          <div className="empty-table">
            <p>No claims found</p>
          </div>
        ) : (
          <table className="claims-table">
            <thead>
              <tr>
                <th>CLAIM ID</th>
                <th>CLAIMANT</th>
                <th>TYPE</th>
                <th>AMOUNT</th>
                <th>PRIORITY</th>
                <th>FRAUD SCORE</th>
                <th>AI DECISION</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.map((claim) => {
                const priority = getPriorityBadge(claim.claimAmount);
                const fraudScore = Math.floor(Math.random() * 100);

                return (
                  <tr key={claim.claimId}>
                    <td className="claim-id">{claim.claimId}</td>
                    <td>{claim.claimantName}</td>
                    <td>{claim.claimType}</td>
                    <td className="amount">
                      ₹{claim.claimAmount.toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span className={`priority-badge ${priority.class}`}>
                        {priority.level}
                      </span>
                    </td>
                    <td>
                      <span className="fraud-score">{fraudScore}</span>
                    </td>
                    <td>{getAiDecision(claim.status)}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(claim.status)}`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="action-icon"
                        onClick={() =>
                          onUpdateStatus(claim.claimId, ClaimStatus.APPROVED)
                        }
                        title="Approve"
                      >
                        ✓
                      </button>
                      <button
                        className="action-icon delete"
                        title="Delete"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Info */}
      <div className="pagination-info">
        Showing {filteredClaims.length} of {claims.length} claims
      </div>
    </div>
  );
}
