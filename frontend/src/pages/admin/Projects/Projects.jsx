import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  FolderKanban,
  Clock3,
  CheckCircle2,
  CalendarDays,
  MapPin,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  AlertCircle,
} from "lucide-react";

import "./Projects.css";

const API_URL = import.meta.env.VITE_API_URL;

const STATUSES = [
  { value: "planning", label: "Planning" },
  { value: "ongoing", label: "Ongoing" },
  { value: "on-hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const EMPTY_FORM = {
  name: "",
  projectCode: "",
  description: "",
  location: "",
  status: "planning",
  startDate: "",
  expectedEndDate: "",
  budget: "0",
  progress: "0",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusLabel(status) {
  return (
    STATUSES.find((item) => item.value === status)?.label ||
    status ||
    "Planning"
  );
}

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const apiRequest = useCallback(async (path, options = {}) => {
    if (!API_URL) {
      throw new Error(
        "API URL is not configured. Check your frontend .env file.",
      );
    }

    const token = localStorage.getItem("builder360_token");

    if (!token) {
      throw new Error("Your session has expired. Please log in again.");
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      localStorage.removeItem("builder360_token");
      localStorage.removeItem("builder360_user");
      window.location.assign("/admin/login");

      throw new Error("Your session has expired. Please log in again.");
    }

    if (!response.ok || !data.success) {
      throw new Error(data.message || "The request could not be completed.");
    }

    return data;
  }, []);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await apiRequest("/api/projects");

      setProjects(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err.message || "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const stats = useMemo(() => {
    return {
      total: projects.length,
      ongoing: projects.filter((p) => p.status === "ongoing").length,
      planning: projects.filter((p) => p.status === "planning").length,
      completed: projects.filter((p) => p.status === "completed").length,
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !query ||
        [
          project.name,
          project.projectCode,
          project.location,
          project.description,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query),
        );

      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  function openCreateModal() {
    setEditingProject(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setNotice("");
    setModalOpen(true);
  }

  function openEditModal(project) {
    setEditingProject(project);

    setForm({
      name: project.name || "",
      projectCode: project.projectCode || "",
      description: project.description || "",
      location: project.location || "",
      status: project.status || "planning",
      startDate: project.startDate
        ? String(project.startDate).slice(0, 10)
        : "",
      expectedEndDate: project.expectedEndDate
        ? String(project.expectedEndDate).slice(0, 10)
        : "",
      budget: String(project.budget ?? 0),
      progress: String(project.progress ?? 0),
    });

    setError("");
    setNotice("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingProject(null);
    setForm({ ...EMPTY_FORM });
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
      ...form,
      budget: Number(form.budget),
      progress: Number(form.progress),
      startDate: form.startDate || null,
      expectedEndDate: form.expectedEndDate || null,
      projectCode: form.projectCode.trim() || undefined,
    };

    try {
      const isEditing = Boolean(editingProject);

      const result = await apiRequest(
        isEditing ? `/api/projects/${editingProject._id}` : "/api/projects",
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );

      if (isEditing) {
        setProjects((previous) =>
          previous.map((project) =>
            project._id === editingProject._id ? result.data : project,
          ),
        );
      } else {
        setProjects((previous) => [result.data, ...previous]);
      }

      setModalOpen(false);
      setEditingProject(null);
      setForm({ ...EMPTY_FORM });

      setNotice(
        isEditing
          ? "Project updated successfully."
          : "Project created successfully.",
      );
    } catch (err) {
      setError(err.message || "Unable to save project.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setError("");
    setNotice("");

    try {
      await apiRequest(`/api/projects/${deleteTarget._id}`, {
        method: "DELETE",
      });

      setProjects((previous) =>
        previous.filter((project) => project._id !== deleteTarget._id),
      );

      setNotice("Project deleted successfully.");
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || "Unable to delete project.");
      setDeleteTarget(null);
    }
  }

  return (
    <div className="projects-page">
      <header className="projects-header">
        <div>
          <span className="projects-eyebrow">PROJECT MANAGEMENT</span>
          <h1>Projects</h1>
          <p>Manage construction projects, budgets, and progress.</p>
        </div>

        <div className="projects-header-actions">
          <button
            type="button"
            className="projects-refresh-button"
            onClick={loadProjects}
            disabled={loading}
            aria-label="Refresh projects"
          >
            <RefreshCw
              size={17}
              className={loading ? "projects-spinning" : ""}
            />
          </button>

          <button
            type="button"
            className="projects-primary-button"
            onClick={openCreateModal}
          >
            <Plus size={18} />
            <span>Add Project</span>
          </button>
        </div>
      </header>

      {notice && (
        <div className="projects-notice projects-notice-success" role="status">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && !modalOpen && (
        <div className="projects-notice projects-notice-error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="projects-stats">
        <article className="projects-stat-card">
          <div className="projects-stat-icon projects-stat-icon-navy">
            <FolderKanban size={21} />
          </div>
          <div>
            <span>Total Projects</span>
            <strong>{loading ? "—" : stats.total}</strong>
            <small>Across all statuses</small>
          </div>
        </article>

        <article className="projects-stat-card">
          <div className="projects-stat-icon projects-stat-icon-amber">
            <Clock3 size={21} />
          </div>
          <div>
            <span>Ongoing</span>
            <strong>{loading ? "—" : stats.ongoing}</strong>
            <small>Currently in progress</small>
          </div>
        </article>

        <article className="projects-stat-card">
          <div className="projects-stat-icon projects-stat-icon-blue">
            <CalendarDays size={21} />
          </div>
          <div>
            <span>Planning</span>
            <strong>{loading ? "—" : stats.planning}</strong>
            <small>Awaiting execution</small>
          </div>
        </article>

        <article className="projects-stat-card">
          <div className="projects-stat-icon projects-stat-icon-green">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Completed</span>
            <strong>{loading ? "—" : stats.completed}</strong>
            <small>Successfully delivered</small>
          </div>
        </article>
      </section>

      <section className="projects-panel">
        <div className="projects-panel-heading">
          <div>
            <h2>All Projects</h2>
            <p>Review and manage your project portfolio.</p>
          </div>

          <span className="projects-count-badge">
            {filteredProjects.length}{" "}
            {filteredProjects.length === 1 ? "project" : "projects"}
          </span>
        </div>

        <div className="projects-toolbar">
          <div className="projects-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search projects, codes, locations..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search projects"
            />
          </div>

          <div className="projects-filter">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter projects by status"
            >
              <option value="all">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
        </div>

        <div className="projects-table-wrapper">
          <table className="projects-table">
            <thead>
              <tr>
                <th>PROJECT</th>
                <th>STATUS</th>
                <th>PROGRESS</th>
                <th>BUDGET</th>
                <th>EXPECTED END</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="projects-table-message">
                    <RefreshCw size={20} className="projects-spinning" />
                    <span>Loading projects...</span>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="6" className="projects-table-message">
                    <div className="projects-empty-icon">
                      <FolderKanban size={28} />
                    </div>
                    <strong>
                      {projects.length === 0
                        ? "No projects yet"
                        : "No matching projects"}
                    </strong>
                    <span>
                      {projects.length === 0
                        ? "Create your first project to get started."
                        : "Try changing your search or status filter."}
                    </span>

                    {projects.length === 0 && (
                      <button
                        type="button"
                        className="projects-empty-button"
                        onClick={openCreateModal}
                      >
                        <Plus size={16} />
                        Add your first project
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project._id}>
                    <td>
                      <div className="projects-name-cell">
                        <div className="projects-row-icon">
                          <FolderKanban size={19} />
                        </div>

                        <div>
                          <strong>{project.name}</strong>
                          <span>
                            {project.projectCode || "No project code"}
                          </span>

                          {project.location && (
                            <small>
                              <MapPin size={12} />
                              {project.location}
                            </small>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`projects-status projects-status-${project.status}`}
                      >
                        <span />
                        {getStatusLabel(project.status)}
                      </span>
                    </td>

                    <td>
                      <div className="projects-progress">
                        <div className="projects-progress-label">
                          <span>{project.progress ?? 0}%</span>
                        </div>
                        <div
                          className="projects-progress-track"
                          role="progressbar"
                          aria-valuenow={project.progress ?? 0}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${project.name} completion`}
                        >
                          <div
                            className="projects-progress-fill"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(0, Number(project.progress) || 0),
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="projects-budget">
                      {formatCurrency(project.budget)}
                    </td>

                    <td className="projects-date">
                      {formatDate(project.expectedEndDate)}
                    </td>

                    <td>
                      <div className="projects-row-actions">
                        <button
                          type="button"
                          className="projects-action-button"
                          onClick={() => openEditModal(project)}
                          title="Edit project"
                          aria-label={`Edit ${project.name}`}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          className="projects-action-button projects-delete-action"
                          onClick={() => setDeleteTarget(project)}
                          title="Delete project"
                          aria-label={`Delete ${project.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && projects.length > 0 && (
          <div className="projects-table-footer">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
        )}
      </section>

      {modalOpen && (
        <div
          className="projects-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="projects-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="projects-modal-title"
          >
            <div className="projects-modal-header">
              <div>
                <span className="projects-eyebrow">PROJECT DETAILS</span>
                <h2 id="projects-modal-title">
                  {editingProject ? "Edit Project" : "Create New Project"}
                </h2>
                <p>
                  {editingProject
                    ? "Update the information for this project."
                    : "Enter the details to add a project to Builder360."}
                </p>
              </div>

              <button
                type="button"
                className="projects-modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <form className="projects-form" onSubmit={handleSubmit}>
              <div className="projects-form-grid">
                <div className="projects-form-field projects-form-field-full">
                  <label htmlFor="project-name">
                    Project Name <span>*</span>
                  </label>
                  <input
                    id="project-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Riverside Commercial Complex"
                    maxLength={150}
                    required
                  />
                </div>

                <div className="projects-form-field">
                  <label htmlFor="project-code">Project Code</label>
                  <input
                    id="project-code"
                    name="projectCode"
                    type="text"
                    value={form.projectCode}
                    onChange={handleFormChange}
                    placeholder="e.g. B360-001"
                    maxLength={50}
                  />
                  <small>Must be unique if provided.</small>
                </div>

                <div className="projects-form-field">
                  <label htmlFor="project-location">Location</label>
                  <input
                    id="project-location"
                    name="location"
                    type="text"
                    value={form.location}
                    onChange={handleFormChange}
                    placeholder="City or project address"
                    maxLength={250}
                  />
                </div>

                <div className="projects-form-field projects-form-field-full">
                  <label htmlFor="project-description">Description</label>
                  <textarea
                    id="project-description"
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Describe the project..."
                    maxLength={3000}
                    rows={3}
                  />
                </div>

                <div className="projects-form-field">
                  <label htmlFor="project-status">Status</label>
                  <select
                    id="project-status"
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                  >
                    {STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="projects-form-field">
                  <label htmlFor="project-progress">Progress (%)</label>
                  <input
                    id="project-progress"
                    name="progress"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={form.progress}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="projects-form-field">
                  <label htmlFor="project-budget">Budget (₹)</label>
                  <input
                    id="project-budget"
                    name="budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.budget}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="projects-form-field">
                  <label htmlFor="project-start-date">Start Date</label>
                  <input
                    id="project-start-date"
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="projects-form-field">
                  <label htmlFor="project-end-date">Expected End Date</label>
                  <input
                    id="project-end-date"
                    name="expectedEndDate"
                    type="date"
                    value={form.expectedEndDate}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              {error && (
                <div className="projects-form-error" role="alert">
                  <AlertCircle size={17} />
                  <span>{error}</span>
                </div>
              )}

              <div className="projects-form-footer">
                <button
                  type="button"
                  className="projects-secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="projects-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingProject
                      ? "Save Changes"
                      : "Create Project"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="projects-modal-backdrop">
          <section
            className="projects-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="projects-delete-title"
          >
            <div className="projects-delete-icon">
              <Trash2 size={24} />
            </div>

            <h2 id="projects-delete-title">Delete this project?</h2>

            <p>
              You are about to delete <strong>{deleteTarget.name}</strong>. This
              action cannot be undone.
            </p>

            <div className="projects-form-footer">
              <button
                type="button"
                className="projects-secondary-button"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="projects-danger-button"
                onClick={handleDelete}
              >
                Delete Project
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Projects;
