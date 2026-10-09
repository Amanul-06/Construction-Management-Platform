import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  MessageSquare,
  Clock3,
  CheckCircle2,
  CircleAlert,
  X,
  Mail,
  Phone,
  Building2,
  CalendarDays,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  FileText,
  Save,
} from "lucide-react";

import "./Enquiries.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5005"
).replace(/\/+$/, "");

const PAGE_SIZE = 20;

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const EMPTY_SUMMARY = {
  total: 0,
  pending: 0,
  inProgress: 0,
  resolved: 0,
};

function getToken() {
  return localStorage.getItem("builder360_token") || "";
}

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status) {
  return (
    STATUSES.find((item) => item.value === status)?.label ||
    status ||
    "Unknown"
  );
}

function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editStatus, setEditStatus] = useState("pending");
  const [editNotes, setEditNotes] = useState("");

  const apiRequest = useCallback(async (path, options = {}) => {
    const token = getToken();

    if (!token) {
      throw new Error("Your admin session has expired. Please log in again.");
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    let result;

    try {
      result = await response.json();
    } catch {
      result = {};
    }

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("builder360_token");
      localStorage.removeItem("builder360_user");
      window.location.assign("/admin/login");

      throw new Error(
        result.message || "Your admin session is no longer valid."
      );
    }

    if (!response.ok || result.success === false) {
      throw new Error(result.message || "The request could not be completed.");
    }

    return result;
  }, []);

  const loadEnquiries = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const query = new URLSearchParams({
          page: String(pagination.page),
          limit: String(PAGE_SIZE),
          status: statusFilter,
          search,
        });

        const result = await apiRequest(
          `/api/enquiries?${query.toString()}`
        );

        const items = Array.isArray(result.data) ? result.data : [];
        const pageInfo = result.pagination || {};

        setEnquiries(items);
        setPagination((current) => ({
          ...current,
          page: Number(pageInfo.page) || 1,
          total: Number(pageInfo.total) || 0,
          totalPages: Math.max(1, Number(pageInfo.totalPages) || 1),
        }));

        // Fetch summary counts independently of the current filter.
        const summaryResult = await apiRequest(
          `/api/enquiries?page=1&limit=1&status=all`
        );

        const total = Number(summaryResult.pagination?.total) || 0;

        const countStatuses = ["pending", "in-progress", "resolved", "closed"];

        const counts = await Promise.all(
          countStatuses.map(async (status) => {
            const response = await apiRequest(
              `/api/enquiries?page=1&limit=1&status=${status}`
            );

            return [
              status,
              Number(response.pagination?.total) || 0,
            ];
          })
        );

        const statusCounts = Object.fromEntries(counts);

        setSummary({
          total,
          pending: statusCounts.pending || 0,
          inProgress: statusCounts["in-progress"] || 0,
          resolved: statusCounts.resolved || 0,
        });
      } catch (requestError) {
        setError(requestError.message || "Unable to load enquiries.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [apiRequest, pagination.page, search, statusFilter]
  );

  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPagination((current) =>
        current.page === 1 ? current : { ...current, page: 1 }
      );
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  function handleStatusFilter(value) {
    setStatusFilter(value);
    setPagination((current) => ({ ...current, page: 1 }));
  }

  async function openEnquiry(id) {
    setSelectedEnquiry(null);
    setDetailLoading(true);
    setError("");

    try {
      const result = await apiRequest(`/api/enquiries/${id}`);

      setSelectedEnquiry(result.data);
      setEditStatus(result.data.status || "pending");
      setEditNotes(result.data.notes || "");
    } catch (requestError) {
      setError(requestError.message || "Unable to open this enquiry.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function saveEnquiry() {
    if (!selectedEnquiry) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const result = await apiRequest(
        `/api/enquiries/${selectedEnquiry._id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: editStatus,
            notes: editNotes,
          }),
        }
      );

      setSelectedEnquiry(result.data);
      setEditStatus(result.data.status);
      setEditNotes(result.data.notes || "");
      setNotice("Enquiry updated successfully.");

      await loadEnquiries({ silent: true });
    } catch (requestError) {
      setError(requestError.message || "Unable to update this enquiry.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEnquiry() {
    if (!selectedEnquiry) return;

    const confirmed = window.confirm(
      `Permanently delete the enquiry from ${selectedEnquiry.name}? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");
    setNotice("");

    try {
      await apiRequest(`/api/enquiries/${selectedEnquiry._id}`, {
        method: "DELETE",
      });

      setSelectedEnquiry(null);
      setNotice("Enquiry deleted successfully.");

      setPagination((current) => ({
        ...current,
        page:
          enquiries.length === 1 && current.page > 1
            ? current.page - 1
            : current.page,
      }));

      await loadEnquiries({ silent: true });
    } catch (requestError) {
      setError(requestError.message || "Unable to delete this enquiry.");
    } finally {
      setDeleting(false);
    }
  }

  const showingStart =
    pagination.total === 0 ? 0 : (pagination.page - 1) * PAGE_SIZE + 1;

  const showingEnd = Math.min(
    pagination.page * PAGE_SIZE,
    pagination.total
  );

  return (
    <div className="enquiries-page">
      <header className="enquiries-header">
        <div>
          <div className="enquiries-eyebrow">
            BUILDER360 <span /> CUSTOMER MANAGEMENT
          </div>

          <h1>Enquiries</h1>

          <p>
            Manage customer enquiries, track follow-ups, and keep every
            conversation organised.
          </p>
        </div>

        <button
          type="button"
          className="enquiries-refresh-button"
          onClick={() => loadEnquiries({ silent: true })}
          disabled={loading || refreshing}
        >
          <RefreshCw
            size={16}
            className={refreshing ? "enquiries-spinning" : ""}
          />
          Refresh
        </button>
      </header>

      {notice && (
        <div className="enquiries-notice" role="status">
          <CheckCircle2 size={17} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="enquiries-error" role="alert">
          <CircleAlert size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="enquiries-summary" aria-label="Enquiry summary">
        <SummaryCard
          label="Total Enquiries"
          value={summary.total}
          icon={MessageSquare}
          tone="navy"
        />

        <SummaryCard
          label="Pending"
          value={summary.pending}
          icon={Clock3}
          tone="amber"
        />

        <SummaryCard
          label="In Progress"
          value={summary.inProgress}
          icon={CircleAlert}
          tone="blue"
        />

        <SummaryCard
          label="Resolved"
          value={summary.resolved}
          icon={CheckCircle2}
          tone="green"
        />
      </section>

      <section className="enquiries-panel">
        <div className="enquiries-panel-heading">
          <div>
            <h2>All Enquiries</h2>
            <p>
              {pagination.total}{" "}
              {pagination.total === 1 ? "enquiry" : "enquiries"} found
            </p>
          </div>
        </div>

        <div className="enquiries-toolbar">
          <label className="enquiries-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search name, email, phone, company..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              aria-label="Search enquiries"
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </label>

          <label className="enquiries-filter">
            <span>Status</span>

            <select
              value={statusFilter}
              onChange={(event) => handleStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>

              {STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="enquiries-table-wrap">
          <table className="enquiries-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Subject</th>
                <th>Date Submitted</th>
                <th>Status</th>
                <th aria-label="Actions">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">
                    <div className="enquiries-table-state">
                      <LoaderCircle
                        size={24}
                        className="enquiries-spinning"
                      />
                      <span>Loading enquiries...</span>
                    </div>
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="enquiries-table-state">
                      <div className="enquiries-empty-icon">
                        <FileText size={25} />
                      </div>

                      <strong>No enquiries found</strong>

                      <span>
                        Try another search or change the status filter.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                enquiries.map((enquiry) => (
                  <tr key={enquiry._id}>
                    <td>
                      <div className="enquiries-customer">
                        <div className="enquiries-avatar">
                          {(enquiry.name || "?").charAt(0).toUpperCase()}
                        </div>

                        <div className="enquiries-customer-info">
                          <strong>{enquiry.name}</strong>
                          <span>{enquiry.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="enquiries-subject">
                        <strong>{enquiry.subject}</strong>
                        {enquiry.company && (
                          <span>{enquiry.company}</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="enquiries-date">
                        <CalendarDays size={15} />
                        <span>{formatDate(enquiry.createdAt)}</span>
                      </div>
                    </td>

                    <td>
                      <StatusBadge status={enquiry.status} />
                    </td>

                    <td>
                      <button
                        type="button"
                        className="enquiries-view-button"
                        onClick={() => openEnquiry(enquiry._id)}
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && pagination.total > 0 && (
          <div className="enquiries-pagination">
            <span>
              Showing <strong>{showingStart}–{showingEnd}</strong> of{" "}
              <strong>{pagination.total}</strong>
            </span>

            <div>
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination((current) => ({
                    ...current,
                    page: current.page - 1,
                  }))
                }
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>

              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPagination((current) => ({
                    ...current,
                    page: current.page + 1,
                  }))
                }
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </section>

      {detailLoading && (
        <div className="enquiries-modal-backdrop">
          <div className="enquiries-modal-loading">
            <LoaderCircle size={30} className="enquiries-spinning" />
            <span>Loading enquiry...</span>
          </div>
        </div>
      )}

      {selectedEnquiry && (
        <div
          className="enquiries-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedEnquiry(null);
            }
          }}
        >
          <section
            className="enquiries-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="enquiry-modal-title"
          >
            <header className="enquiries-modal-header">
              <div>
                <span className="enquiries-modal-eyebrow">
                  CUSTOMER ENQUIRY
                </span>
                <h2 id="enquiry-modal-title">Enquiry Details</h2>
              </div>

              <button
                type="button"
                className="enquiries-icon-button"
                onClick={() => setSelectedEnquiry(null)}
                aria-label="Close enquiry details"
              >
                <X size={21} />
              </button>
            </header>

            <div className="enquiries-modal-body">
              <div className="enquiries-detail-customer">
                <div className="enquiries-avatar enquiries-avatar-large">
                  {(selectedEnquiry.name || "?").charAt(0).toUpperCase()}
                </div>

                <div>
                  <h3>{selectedEnquiry.name}</h3>
                  <p>Submitted {formatDate(selectedEnquiry.createdAt)}</p>
                </div>
              </div>

              <div className="enquiries-detail-grid">
                <DetailItem
                  icon={Mail}
                  label="Email Address"
                  value={selectedEnquiry.email}
                  href={
                    selectedEnquiry.email
                      ? `mailto:${selectedEnquiry.email}`
                      : undefined
                  }
                />

                <DetailItem
                  icon={Phone}
                  label="Phone Number"
                  value={selectedEnquiry.phone || "Not provided"}
                  href={
                    selectedEnquiry.phone
                      ? `tel:${selectedEnquiry.phone}`
                      : undefined
                  }
                />

                <DetailItem
                  icon={Building2}
                  label="Company"
                  value={selectedEnquiry.company || "Not provided"}
                />

                <DetailItem
                  icon={FileText}
                  label="Subject"
                  value={selectedEnquiry.subject}
                />
              </div>

              <div className="enquiries-message-box">
                <h3>Customer Message</h3>
                <p>{selectedEnquiry.message}</p>
              </div>

              <div className="enquiries-edit-section">
                <label>
                  <span>Enquiry Status</span>

                  <select
                    value={editStatus}
                    onChange={(event) => setEditStatus(event.target.value)}
                  >
                    {STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Internal Notes</span>

                  <textarea
                    rows={4}
                    maxLength={3000}
                    placeholder="Record follow-ups or important details for your team..."
                    value={editNotes}
                    onChange={(event) => setEditNotes(event.target.value)}
                  />

                  <small>{editNotes.length}/3000 characters</small>
                </label>
              </div>
            </div>

            <footer className="enquiries-modal-footer">
              <button
                type="button"
                className="enquiries-delete-button"
                onClick={deleteEnquiry}
                disabled={deleting || saving}
              >
                <Trash2 size={16} />
                {deleting ? "Deleting..." : "Delete"}
              </button>

              <div>
                <button
                  type="button"
                  className="enquiries-cancel-button"
                  onClick={() => setSelectedEnquiry(null)}
                  disabled={saving || deleting}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="enquiries-save-button"
                  onClick={saveEnquiry}
                  disabled={saving || deleting}
                >
                  {saving ? (
                    <LoaderCircle
                      size={16}
                      className="enquiries-spinning"
                    />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, tone }) {
  return (
    <article className={`enquiries-summary-card tone-${tone}`}>
      <div className="enquiries-summary-top">
        <span>{label}</span>

        <div className="enquiries-summary-icon">
          <Icon size={20} />
        </div>
      </div>

      <strong>{value.toLocaleString("en-IN")}</strong>
      <span className="enquiries-summary-caption">Enquiry records</span>
    </article>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`enquiries-status status-${status || "pending"}`}>
      <span />
      {getStatusLabel(status)}
    </span>
  );
}

function DetailItem({ icon: Icon, label, value, href }) {
  return (
    <div className="enquiries-detail-item">
      <div className="enquiries-detail-icon">
        <Icon size={17} />
      </div>

      <div>
        <span>{label}</span>

        {href ? (
          <a href={href}>{value}</a>
        ) : (
          <strong>{value}</strong>
        )}
      </div>
    </div>
  );
}

export default Enquiries;
