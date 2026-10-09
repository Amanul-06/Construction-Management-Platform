import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Edit3,
  ImagePlus,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Send,
  Upload,
  X,
} from "lucide-react";

import "./Progress.css";

const API_URL = `${(import.meta.env.VITE_API_URL || "http://localhost:5005")
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "")}/api`;

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const getToken = () => localStorage.getItem("builder360_token") || "";

const getAuthHeaders = () => {
  const token = getToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

async function apiRequest(path, options = {}) {
  const token = getToken();

  if (!token) {
    throw new Error(
      "You are not logged in. Please log in through Admin Login.",
    );
  }

  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  let result = null;

  if (contentType.includes("application/json")) {
    result = await response.json().catch(() => null);
  } else {
    result = await response.text().catch(() => "");
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "Authentication failed. Please log out and log in again through Admin Login.",
      );
    }

    if (response.status === 403) {
      throw new Error("You do not have permission to perform this action.");
    }

    const message =
      result?.message ||
      result?.error ||
      (typeof result === "string" && result) ||
      `Request failed with status ${response.status}.`;

    throw new Error(message);
  }

  return result;
}

function getToday() {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

function getErrorMessage(error) {
  return error?.message || "Something went wrong. Please try again.";
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateLong(value) {
  if (!value) return "No date selected";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getProjectId(project) {
  if (!project) return "";

  return String(project._id || project.id || project.projectId || "");
}

function getUpdateId(update) {
  if (!update) return "";

  return String(update._id || update.id || update.updateId || "");
}

function getImageId(image) {
  if (!image) return "";

  if (typeof image === "string") {
    return image;
  }

  return String(
    image.fileId ||
      image._id ||
      image.id ||
      image.imageId ||
      image.filename ||
      image.key ||
      "",
  );
}

function getImageUrl(image) {
  if (!image || typeof image === "string") return "";

  return (
    image.url ||
    image.imageUrl ||
    image.secure_url ||
    image.path ||
    image.src ||
    ""
  );
}

function getImageName(image, index = 0) {
  if (!image) return `Site photograph ${index + 1}`;

  if (typeof image === "string") {
    return `Site photograph ${index + 1}`;
  }

  return (
    image.originalname ||
    image.originalName ||
    image.filename ||
    image.name ||
    `Site photograph ${index + 1}`
  );
}

function getProjectLocation(project) {
  if (!project) return "";

  if (typeof project.location === "string") {
    return project.location;
  }

  if (project.location && typeof project.location === "object") {
    return (
      project.location.address ||
      project.location.name ||
      project.location.city ||
      ""
    );
  }

  return (
    project.address ||
    project.siteAddress ||
    project.siteLocation ||
    project.city ||
    ""
  );
}

function getUpdateDate(update) {
  return (
    update?.date ||
    update?.reportDate ||
    update?.createdAt ||
    update?.updatedAt ||
    ""
  );
}

function getProgressValue(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return 0;

  return Math.min(100, Math.max(0, Math.round(number)));
}

function getProgressImages(update) {
  if (!update) return [];

  const images =
    update.images ||
    update.photos ||
    update.sitePhotos ||
    update.attachments ||
    [];

  return Array.isArray(images) ? images : [];
}

function getProjectName(project) {
  if (!project) return "Unnamed project";

  return (
    project.name ||
    project.projectName ||
    project.title ||
    project.siteName ||
    "Unnamed project"
  );
}

function getProjectStatus(project) {
  if (!project) return "Active";

  return String(project.status || project.projectStatus || "Active");
}

function getProjectDescription(project) {
  if (!project) return "";

  return (
    project.description || project.projectDescription || project.details || ""
  );
}

function getUpdateDescription(update) {
  return (
    update?.description ||
    update?.title ||
    update?.summary ||
    "Daily site update"
  );
}

function getWorkCompleted(update) {
  return (
    update?.workCompleted ||
    update?.work ||
    update?.workDescription ||
    update?.details ||
    ""
  );
}

function getUpdateProgress(update) {
  return getProgressValue(
    update?.progressPercentage ??
      update?.progress ??
      update?.completionPercentage ??
      0,
  );
}

function getLatestProjectProgress(project, updates) {
  if (updates.length > 0) {
    return getUpdateProgress(updates[0]);
  }

  return getProgressValue(
    project?.progressPercentage ??
      project?.progress ??
      project?.completionPercentage ??
      0,
  );
}

function getReportDateInput(value) {
  if (!value) return getToday();

  const dateString = String(value);

  if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
    return dateString.slice(0, 10);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return getToday();
  }

  return date.toISOString().slice(0, 10);
}

function ProgressImage({ image, index, onOpen, className = "" }) {
  const [src, setSrc] = useState("");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const imageId = getImageId(image);
  const directUrl = getImageUrl(image);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";

    async function loadImage() {
      setLoading(true);
      setFailed(false);
      setSrc("");

      if (directUrl) {
        if (!cancelled) {
          setSrc(directUrl);
          setLoading(false);
        }

        return;
      }

      if (!imageId) {
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
        }

        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/progress/images/${encodeURIComponent(imageId)}`,
          {
            headers: getAuthHeaders(),
          },
        );

        if (!response.ok) {
          throw new Error("Unable to load this image.");
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);

        if (!cancelled) {
          setSrc(objectUrl);
          setLoading(false);
        } else {
          URL.revokeObjectURL(objectUrl);
        }
      } catch {
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
        }
      }
    }

    loadImage();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageId, directUrl]);

  return (
    <button
      type="button"
      className={`progress-image ${className}`}
      onClick={() => {
        if (src && !failed && onOpen) {
          onOpen(src, getImageName(image, index));
        }
      }}
      disabled={!src || failed || loading}
      aria-label={`Open ${getImageName(image, index)}`}
    >
      {loading && (
        <span className="progress-image-placeholder">
          <LoaderCircle className="spin" size={20} />
        </span>
      )}

      {failed && !loading && (
        <span className="progress-image-placeholder progress-image-failed">
          <ImagePlus size={22} />
          <small>Unavailable</small>
        </span>
      )}

      {src && !failed && (
        <img
          src={src}
          alt={getImageName(image, index)}
          loading="lazy"
          onError={() => setFailed(true)}
          className={loading ? "image-loading" : ""}
        />
      )}

      {!loading && !failed && src && (
        <span className="progress-image-expand">View photo</span>
      )}
    </button>
  );
}

function ProgressBar({ value, className = "" }) {
  const progress = getProgressValue(value);

  return (
    <div
      className={`progress-bar-track ${className}`}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Project completion"
    >
      <span className="progress-bar-fill" style={{ width: `${progress}%` }} />
    </div>
  );
}

function EmptyState({
  icon: Icon = ClipboardCheck,
  title,
  description,
  action,
}) {
  return (
    <div className="progress-empty-state">
      <div className="progress-empty-icon">
        <Icon size={26} />
      </div>

      <h3>{title}</h3>

      {description && <p>{description}</p>}

      {action}
    </div>
  );
}

export default function Progress() {
  const [searchParams, setSearchParams] = useSearchParams();

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const formTopRef = useRef(null);

  // These refs let the project loader access current values without
  // recreating the loader every time the dropdown selection changes.
  const selectedProjectIdRef = useRef(searchParams.get("projectId") || "");
  const initialProjectIdRef = useRef(searchParams.get("projectId") || "");

  const [projects, setProjects] = useState([]);

  const [selectedProjectId, setSelectedProjectId] = useState(
    searchParams.get("projectId") || "",
  );

  const [updates, setUpdates] = useState([]);

  const [date, setDate] = useState(getToday());
  const [description, setDescription] = useState("");
  const [workCompleted, setWorkCompleted] = useState("");
  const [progressPercentage, setProgressPercentage] = useState(0);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [editingUpdateId, setEditingUpdateId] = useState("");
  const [existingImages, setExistingImages] = useState([]);

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [draggingFiles, setDraggingFiles] = useState(false);

  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [lightbox, setLightbox] = useState(null);

  const selectedProject =
    projects.find((project) => getProjectId(project) === selectedProjectId) ||
    null;

  const sortedUpdates = [...updates].sort((a, b) => {
    const first = new Date(getUpdateDate(a) || 0).getTime();
    const second = new Date(getUpdateDate(b) || 0).getTime();

    return second - first;
  });

  const latestUpdate = sortedUpdates[0] || null;

  const currentProgress = getLatestProjectProgress(
    selectedProject,
    sortedUpdates,
  );

  const completedReports = sortedUpdates.length;

  const totalImages = sortedUpdates.reduce(
    (total, update) => total + getProgressImages(update).length,
    0,
  );

  const latestReportDate = latestUpdate
    ? formatDate(getUpdateDate(latestUpdate))
    : "No reports yet";

  const remainingImageSlots = Math.max(
    0,
    MAX_IMAGES - existingImages.length - selectedFiles.length,
  );

  // Stable callback: does not depend on selectedProjectId or searchParams.
  // This prevents changing the dropdown from repeatedly reloading projects.
  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    setPageError("");

    try {
      const result = await apiRequest("/projects");

      const projectList = Array.isArray(result)
        ? result
        : result?.projects || result?.data?.projects || result?.data || [];

      const safeProjects = Array.isArray(projectList) ? projectList : [];

      setProjects(safeProjects);

      const requestedProjectId = new URLSearchParams(
        window.location.search,
      ).get("projectId");

      const currentProjectId = selectedProjectIdRef.current;

      const requestedProject = safeProjects.find(
        (project) => getProjectId(project) === requestedProjectId,
      );

      const currentProject = safeProjects.find(
        (project) => getProjectId(project) === currentProjectId,
      );

      const initialProject = safeProjects.find(
        (project) => getProjectId(project) === initialProjectIdRef.current,
      );

      const nextProjectId =
        getProjectId(requestedProject) ||
        getProjectId(currentProject) ||
        getProjectId(initialProject) ||
        getProjectId(safeProjects[0]) ||
        "";

      selectedProjectIdRef.current = nextProjectId;

      setSelectedProjectId((previousId) =>
        previousId === nextProjectId ? previousId : nextProjectId,
      );

      const urlProjectId = new URLSearchParams(window.location.search).get(
        "projectId",
      );

      if (urlProjectId !== nextProjectId) {
        setSearchParams(nextProjectId ? { projectId: nextProjectId } : {}, {
          replace: true,
        });
      }
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoadingProjects(false);
    }
  }, [setSearchParams]);

  // There is intentionally only ONE loadUpdates declaration.
  const loadUpdates = useCallback(async (projectId, showRefresh = false) => {
    if (!projectId) {
      setUpdates([]);
      setLoadingUpdates(false);
      setRefreshing(false);
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoadingUpdates(true);
    }

    setPageError("");

    try {
      const result = await apiRequest(
        `/progress/${encodeURIComponent(projectId)}`,
      );

      const updateList = Array.isArray(result)
        ? result
        : result?.updates ||
          result?.progressUpdates ||
          result?.reports ||
          result?.data?.updates ||
          result?.data?.progressUpdates ||
          result?.data ||
          [];

      setUpdates(Array.isArray(updateList) ? updateList : []);
    } catch (error) {
      setUpdates([]);
      setPageError(getErrorMessage(error));
    } finally {
      setLoadingUpdates(false);
      setRefreshing(false);
    }
  }, []);

  // Load projects only once when the page mounts.
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Fetch history whenever the actual selected project changes.
  useEffect(() => {
    if (selectedProjectId) {
      loadUpdates(selectedProjectId);
    } else {
      setUpdates([]);
      setLoadingUpdates(false);
    }
  }, [selectedProjectId, loadUpdates]);

  useEffect(() => {
    const nextPreviews = selectedFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      lastModified: file.lastModified,
    }));

    setPreviews(nextPreviews);

    return () => {
      nextPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [selectedFiles]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setLightbox(null);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function clearFileInput() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function resetForm() {
    setEditingUpdateId("");
    setExistingImages([]);
    setDate(getToday());
    setDescription("");
    setWorkCompleted("");
    setProgressPercentage(currentProgress);
    setSelectedFiles([]);
    setFormError("");
    setSuccessMessage("");

    clearFileInput();
  }

  function handleProjectChange(event) {
    const projectId = event.target.value;

    // Update the ref immediately so async project loading cannot restore
    // the previous selection.
    selectedProjectIdRef.current = projectId;

    resetForm();

    setSelectedProjectId(projectId);

    const currentUrlProjectId = new URLSearchParams(window.location.search).get(
      "projectId",
    );

    if (currentUrlProjectId !== projectId) {
      setSearchParams(projectId ? { projectId } : {}, { replace: true });
    }

    setPageError("");
    setFormError("");
    setSuccessMessage("");
  }

  function handleFilesSelected(fileList) {
    if (!fileList || fileList.length === 0) return;

    setFormError("");
    setSuccessMessage("");

    const incomingFiles = Array.from(fileList);
    const validFiles = [];
    const errors = [];

    const existingKeys = new Set(
      selectedFiles.map(
        (file) => `${file.name}-${file.size}-${file.lastModified}`,
      ),
    );

    for (const file of incomingFiles) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        errors.push(
          `${file.name}: only JPEG, PNG, and WebP images are allowed.`,
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: file size exceeds 5 MB.`);
        continue;
      }

      const key = `${file.name}-${file.size}-${file.lastModified}`;

      if (existingKeys.has(key)) {
        continue;
      }

      existingKeys.add(key);
      validFiles.push(file);
    }

    const availableSlots = Math.max(
      0,
      MAX_IMAGES - existingImages.length - selectedFiles.length,
    );

    if (validFiles.length > availableSlots) {
      errors.push(
        `You can have a maximum of ${MAX_IMAGES} images per report. You can add ${availableSlots} more.`,
      );
    }

    const acceptedFiles = validFiles.slice(0, availableSlots);

    if (acceptedFiles.length > 0) {
      setSelectedFiles((previous) =>
        [...previous, ...acceptedFiles].slice(
          0,
          Math.max(0, MAX_IMAGES - existingImages.length),
        ),
      );
    }

    if (errors.length > 0) {
      setFormError(errors.join(" "));
    }

    clearFileInput();
  }

  function handleFileInputChange(event) {
    handleFilesSelected(event.target.files);
  }

  function handleDragOver(event) {
    event.preventDefault();
    setDraggingFiles(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();

    if (
      dropZoneRef.current &&
      !dropZoneRef.current.contains(event.relatedTarget)
    ) {
      setDraggingFiles(false);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setDraggingFiles(false);

    handleFilesSelected(event.dataTransfer.files);
  }

  function removeSelectedFile(indexToRemove) {
    setSelectedFiles((previous) =>
      previous.filter((_, index) => index !== indexToRemove),
    );

    setFormError("");
    setSuccessMessage("");
  }

  function removeExistingImage(image) {
    const imageId = getImageId(image);

    if (!imageId) {
      setFormError(
        "This photograph does not have a usable image ID and cannot be removed.",
      );
      return;
    }

    setExistingImages((previous) =>
      previous.filter((item) => getImageId(item) !== imageId),
    );

    setFormError("");
    setSuccessMessage("");
  }

  function startEditing(update) {
    const updateId = getUpdateId(update);

    if (!updateId) {
      setFormError("Unable to identify this progress report.");
      return;
    }

    setEditingUpdateId(updateId);

    setDate(getReportDateInput(getUpdateDate(update)));

    setDescription(
      getUpdateDescription(update) === "Daily site update" &&
        !update.description &&
        !update.title &&
        !update.summary
        ? ""
        : update.description || update.title || update.summary || "",
    );

    setWorkCompleted(getWorkCompleted(update));
    setProgressPercentage(getUpdateProgress(update));
    setExistingImages(getProgressImages(update));
    setSelectedFiles([]);

    setFormError("");
    setSuccessMessage("");
    setPageError("");

    clearFileInput();

    requestAnimationFrame(() => {
      formTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function cancelEditing() {
    setEditingUpdateId("");
    setExistingImages([]);
    setSelectedFiles([]);

    setDate(getToday());
    setDescription("");
    setWorkCompleted("");
    setProgressPercentage(currentProgress);

    setFormError("");
    setSuccessMessage("");

    clearFileInput();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    if (!selectedProjectId) {
      setFormError("Please select a project before submitting.");
      return;
    }

    if (!date) {
      setFormError("Please select the report date.");
      return;
    }

    if (date > getToday()) {
      setFormError("The report date cannot be in the future.");
      return;
    }

    if (!description.trim()) {
      setFormError("Please enter a report title.");
      return;
    }

    if (description.trim().length > 3000) {
      setFormError("The report title must not exceed 3,000 characters.");
      return;
    }

    if (!workCompleted.trim()) {
      setFormError("Please describe the work completed.");
      return;
    }

    if (workCompleted.trim().length > 2000) {
      setFormError("The work description must not exceed 2,000 characters.");
      return;
    }

    const percentage = Number(progressPercentage);

    if (!Number.isInteger(percentage) || percentage < 0 || percentage > 100) {
      setFormError("Progress must be a whole number between 0 and 100.");
      return;
    }

    if (existingImages.length + selectedFiles.length > MAX_IMAGES) {
      setFormError(
        `You can have a maximum of ${MAX_IMAGES} images per report.`,
      );
      return;
    }

    if (
      editingUpdateId &&
      !sortedUpdates.some((update) => getUpdateId(update) === editingUpdateId)
    ) {
      setFormError(
        "This report is no longer available in the current project history. Refresh and try again.",
      );
      return;
    }

    const formData = new FormData();

    formData.append("date", date);
    formData.append("description", description.trim());
    formData.append("workCompleted", workCompleted.trim());
    formData.append("progressPercentage", String(percentage));

    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    if (editingUpdateId) {
      formData.append(
        "keepImageIds",
        JSON.stringify(existingImages.map((image) => getImageId(image))),
      );
    }

    setSubmitting(true);

    try {
      if (editingUpdateId) {
        await apiRequest(
          `/progress/${encodeURIComponent(selectedProjectId)}/${encodeURIComponent(editingUpdateId)}`,
          {
            method: "PUT",
            body: formData,
          },
        );

        setSuccessMessage("Progress report updated successfully.");
      } else {
        await apiRequest(`/progress/${encodeURIComponent(selectedProjectId)}`, {
          method: "POST",
          body: formData,
        });

        setSuccessMessage("Daily progress report submitted successfully.");
      }

      setEditingUpdateId("");
      setExistingImages([]);
      setDate(getToday());
      setDescription("");
      setWorkCompleted("");
      setProgressPercentage(percentage);
      setSelectedFiles([]);

      clearFileInput();

      await loadUpdates(selectedProjectId, true);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  function openLightbox(src, name) {
    setLightbox({ src, name });
  }

  function handleRefresh() {
    if (selectedProjectId) {
      loadUpdates(selectedProjectId, true);
    } else {
      loadProjects();
    }
  }

  return (
    <main className="progress-page">
      <div className="progress-shell">
        <header className="progress-header">
          <div className="progress-header-main">
            <div className="progress-breadcrumb">
              <span>BUILDER360</span>
              <span className="progress-breadcrumb-divider">/</span>
              <span>PROJECT MANAGEMENT</span>
            </div>

            <div className="progress-title-row">
              <div className="progress-title-icon">
                <Activity size={24} />
              </div>

              <div>
                <h1>Daily Progress</h1>
                <p>
                  Record site activities, track completion, and keep everyone up
                  to date.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="progress-refresh-button"
            onClick={handleRefresh}
            disabled={refreshing || loadingProjects}
          >
            <RefreshCw size={16} className={refreshing ? "spin" : ""} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </header>

        {pageError && (
          <div className="progress-alert progress-alert-error" role="alert">
            <AlertCircle size={19} />

            <div>
              <strong>Something needs your attention</strong>
              <p>{pageError}</p>
            </div>

            <button
              type="button"
              onClick={() => setPageError("")}
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <section className="progress-project-selector">
          <div className="progress-project-selector-icon">
            <Building2 size={21} />
          </div>

          <div className="progress-project-selector-copy">
            <label htmlFor="progress-project-select">SELECT PROJECT</label>
            <p>Choose the construction site for this report.</p>
          </div>

          <div className="progress-project-select-wrap">
            <select
              id="progress-project-select"
              value={selectedProjectId}
              onChange={handleProjectChange}
              disabled={loadingProjects || projects.length === 0 || submitting}
            >
              {loadingProjects && <option value="">Loading projects...</option>}

              {!loadingProjects && projects.length === 0 && (
                <option value="">No projects available</option>
              )}

              {projects.map((project) => (
                <option
                  key={getProjectId(project)}
                  value={getProjectId(project)}
                >
                  {getProjectName(project)}
                </option>
              ))}
            </select>

            <ChevronDown size={17} />
          </div>
        </section>

        {loadingProjects ? (
          <section className="progress-card progress-loading-card">
            <LoaderCircle className="spin" size={28} />
            <p>Loading your projects...</p>
          </section>
        ) : projects.length === 0 ? (
          <section className="progress-card">
            <EmptyState
              icon={Building2}
              title="No projects available"
              description="Once a project is available to your account, you can start recording daily site progress here."
              action={
                <button
                  type="button"
                  className="progress-button progress-button-secondary"
                  onClick={loadProjects}
                >
                  <RefreshCw size={16} />
                  Retry
                </button>
              }
            />
          </section>
        ) : (
          <>
            <section className="progress-project-banner">
              <div className="progress-project-banner-top">
                <div className="progress-project-identity">
                  <span className="progress-project-label">
                    CURRENT PROJECT
                  </span>

                  <h2>{getProjectName(selectedProject)}</h2>

                  {getProjectLocation(selectedProject) && (
                    <div className="progress-project-location">
                      <MapPin size={15} />
                      <span>{getProjectLocation(selectedProject)}</span>
                    </div>
                  )}
                </div>

                <span className="progress-status-badge">
                  <span className="progress-status-dot" />
                  {getProjectStatus(selectedProject)}
                </span>
              </div>

              {getProjectDescription(selectedProject) && (
                <p className="progress-project-description">
                  {getProjectDescription(selectedProject)}
                </p>
              )}

              <div className="progress-project-completion">
                <div className="progress-project-completion-copy">
                  <span>Latest recorded completion</span>
                  <strong>{currentProgress}%</strong>
                </div>

                <ProgressBar value={currentProgress} />

                <div className="progress-completion-foot">
                  <span>0%</span>
                  <span>100% complete</span>
                </div>
              </div>
            </section>

            <section className="progress-stats-grid">
              <article className="progress-stat-card">
                <div className="progress-stat-top">
                  <span>Project progress</span>
                  <div className="progress-stat-icon progress-stat-icon-amber">
                    <Activity size={19} />
                  </div>
                </div>

                <div className="progress-stat-value">
                  {currentProgress}
                  <span>%</span>
                </div>

                <div className="progress-stat-bottom">
                  <ProgressBar value={currentProgress} />
                  <span>Latest update</span>
                </div>
              </article>

              <article className="progress-stat-card">
                <div className="progress-stat-top">
                  <span>Daily reports</span>
                  <div className="progress-stat-icon progress-stat-icon-blue">
                    <ClipboardCheck size={19} />
                  </div>
                </div>

                <div className="progress-stat-value">
                  {completedReports.toString().padStart(2, "0")}
                </div>

                <p className="progress-stat-caption">
                  {completedReports === 1
                    ? "Report recorded"
                    : "Reports recorded"}
                </p>
              </article>

              <article className="progress-stat-card">
                <div className="progress-stat-top">
                  <span>Site photographs</span>
                  <div className="progress-stat-icon progress-stat-icon-purple">
                    <ImagePlus size={19} />
                  </div>
                </div>

                <div className="progress-stat-value">
                  {totalImages.toString().padStart(2, "0")}
                </div>

                <p className="progress-stat-caption">Across all reports</p>
              </article>

              <article className="progress-stat-card">
                <div className="progress-stat-top">
                  <span>Last report</span>
                  <div className="progress-stat-icon progress-stat-icon-green">
                    <Clock3 size={19} />
                  </div>
                </div>

                <div className="progress-stat-date">
                  {latestUpdate ? formatDate(getUpdateDate(latestUpdate)) : "—"}
                </div>

                <p className="progress-stat-caption">
                  {latestUpdate
                    ? "Most recent submission"
                    : "Waiting for first report"}
                </p>
              </article>
            </section>

            <section className="progress-main-grid">
              <div
                className="progress-card progress-report-card"
                ref={formTopRef}
              >
                <div className="progress-card-heading">
                  <div className="progress-card-heading-icon">
                    {editingUpdateId ? (
                      <Edit3 size={21} />
                    ) : (
                      <ClipboardCheck size={21} />
                    )}
                  </div>

                  <div>
                    <h2>
                      {editingUpdateId
                        ? "Edit progress report"
                        : "Create daily report"}
                    </h2>

                    <p>
                      {editingUpdateId
                        ? "Update the existing report and its photographs."
                        : "Document the work completed at your site today."}
                    </p>
                  </div>

                  <span className="progress-required-label">* Required</span>
                </div>

                {editingUpdateId && (
                  <div className="progress-alert progress-alert-success">
                    <Edit3 size={18} />

                    <div>
                      <strong>Editing existing report</strong>
                      <p>
                        Changes will update this report instead of creating a
                        new one.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={cancelEditing}
                      disabled={submitting}
                      aria-label="Cancel editing"
                    >
                      <X size={17} />
                    </button>
                  </div>
                )}

                <div className="progress-form-divider" />

                <form onSubmit={handleSubmit} noValidate>
                  <div className="progress-form-section">
                    <div className="progress-form-section-heading">
                      <span className="progress-section-number">01</span>

                      <div>
                        <h3>Report details</h3>
                        <p>Identify the report and when the work took place.</p>
                      </div>
                    </div>

                    <div className="progress-form-row">
                      <div className="progress-field">
                        <label htmlFor="progress-date">
                          Report date <span>*</span>
                        </label>

                        <div className="progress-input-with-icon">
                          <CalendarDays size={17} />

                          <input
                            id="progress-date"
                            type="date"
                            value={date}
                            max={getToday()}
                            onChange={(event) => setDate(event.target.value)}
                            required
                          />
                        </div>

                        <small>
                          Use the date when the site work was performed.
                        </small>
                      </div>

                      <div className="progress-field">
                        <label htmlFor="progress-description">
                          Report title <span>*</span>
                        </label>

                        <input
                          id="progress-description"
                          type="text"
                          placeholder="e.g. Foundation work — Block A"
                          value={description}
                          maxLength={3000}
                          onChange={(event) =>
                            setDescription(event.target.value)
                          }
                          required
                        />

                        <small>{description.length}/3000 characters</small>
                      </div>
                    </div>
                  </div>

                  <div className="progress-form-divider" />

                  <div className="progress-form-section">
                    <div className="progress-form-section-heading">
                      <span className="progress-section-number">02</span>

                      <div>
                        <h3>Work completed</h3>
                        <p>
                          Describe completed tasks, materials, and important
                          site observations.
                        </p>
                      </div>
                    </div>

                    <div className="progress-field">
                      <label htmlFor="progress-work">
                        Work description <span>*</span>
                      </label>

                      <textarea
                        id="progress-work"
                        placeholder="What work was completed? Mention the work area, activities, materials used, and any issues or delays..."
                        value={workCompleted}
                        maxLength={2000}
                        rows={5}
                        onChange={(event) =>
                          setWorkCompleted(event.target.value)
                        }
                        required
                      />

                      <div className="progress-textarea-footer">
                        <small>Be clear and specific about the work.</small>
                        <small>{workCompleted.length}/2000</small>
                      </div>
                    </div>
                  </div>

                  <div className="progress-form-divider" />

                  <div className="progress-form-section">
                    <div className="progress-form-section-heading">
                      <span className="progress-section-number">03</span>

                      <div>
                        <h3>Project completion</h3>
                        <p>
                          Record the overall completion percentage after the
                          reported work.
                        </p>
                      </div>
                    </div>

                    <div className="progress-percentage-panel">
                      <div className="progress-percentage-main">
                        <div>
                          <span className="progress-percentage-eyebrow">
                            COMPLETION
                          </span>

                          <div className="progress-percentage-number">
                            <input
                              aria-label="Project completion percentage"
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={progressPercentage}
                              onChange={(event) =>
                                setProgressPercentage(event.target.value)
                              }
                            />

                            <span>%</span>
                          </div>
                        </div>

                        <div className="progress-percentage-description">
                          <strong>
                            {Number(progressPercentage) === 100
                              ? "Project complete"
                              : Number(progressPercentage) === 0
                                ? "Just getting started"
                                : "Work in progress"}
                          </strong>

                          <span>
                            {Number(progressPercentage) === 100
                              ? "All work has been recorded as complete."
                              : "Adjust the slider to set the completion level."}
                          </span>
                        </div>
                      </div>

                      <div className="progress-slider-wrap">
                        <input
                          type="range"
                          aria-label="Adjust project completion"
                          min="0"
                          max="100"
                          step="1"
                          value={getProgressValue(progressPercentage)}
                          style={{
                            "--slider-progress": `${getProgressValue(
                              progressPercentage,
                            )}%`,
                          }}
                          onChange={(event) =>
                            setProgressPercentage(event.target.value)
                          }
                        />

                        <div className="progress-slider-labels">
                          <span>0% · Not started</span>
                          <span>50% · In progress</span>
                          <span>100% · Complete</span>
                        </div>
                      </div>
                    </div>

                    <div className="progress-percentage-note">
                      <AlertCircle size={16} />

                      <span>
                        Enter the overall project completion, not just the
                        percentage of today's work.
                      </span>
                    </div>
                  </div>

                  <div className="progress-form-divider" />

                  <div className="progress-form-section">
                    <div className="progress-form-section-heading">
                      <span className="progress-section-number">04</span>

                      <div>
                        <h3>Site photographs</h3>
                        <p>
                          Keep existing photos, remove unwanted ones, or upload
                          new site photographs.
                        </p>
                      </div>

                      <span className="progress-photo-counter">
                        {existingImages.length + selectedFiles.length}/
                        {MAX_IMAGES}
                      </span>
                    </div>

                    {editingUpdateId && existingImages.length > 0 && (
                      <div className="progress-selected-photos">
                        <div className="progress-selected-photos-heading">
                          <strong>Existing photographs</strong>
                          <span>{existingImages.length} retained</span>
                        </div>

                        <div className="progress-preview-grid">
                          {existingImages.map((image, index) => (
                            <div
                              className="progress-preview-card"
                              key={getImageId(image) || `existing-${index}`}
                            >
                              <ProgressImage
                                image={image}
                                index={index}
                                onOpen={openLightbox}
                              />

                              <button
                                type="button"
                                className="progress-preview-remove"
                                onClick={() => removeExistingImage(image)}
                                disabled={submitting}
                                aria-label={`Remove ${getImageName(image, index)}`}
                              >
                                <X size={15} />
                              </button>

                              <div className="progress-preview-info">
                                <span title={getImageName(image, index)}>
                                  {getImageName(image, index)}
                                </span>

                                <small>Existing photograph</small>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div
                      ref={dropZoneRef}
                      className={`progress-upload-zone ${
                        draggingFiles ? "is-dragging" : ""
                      } ${remainingImageSlots === 0 ? "is-upload-full" : ""}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleFileInputChange}
                        hidden
                      />

                      <div className="progress-upload-icon">
                        <Upload size={23} />
                      </div>

                      <div className="progress-upload-copy">
                        <strong>
                          {draggingFiles
                            ? "Drop your photographs here"
                            : "Drag and drop site photos"}
                        </strong>

                        <span>Or browse your device to select images.</span>

                        <small>
                          JPEG, PNG or WebP · Maximum 10 images · 5 MB per image
                        </small>
                      </div>

                      <button
                        type="button"
                        className="progress-browse-button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={remainingImageSlots === 0 || submitting}
                      >
                        Browse files
                      </button>
                    </div>

                    {previews.length > 0 && (
                      <div className="progress-selected-photos">
                        <div className="progress-selected-photos-heading">
                          <strong>New photographs</strong>
                          <span>{selectedFiles.length} ready to upload</span>
                        </div>

                        <div className="progress-preview-grid">
                          {previews.map((preview, index) => (
                            <div
                              className="progress-preview-card"
                              key={`${preview.name}-${preview.lastModified}-${index}`}
                            >
                              <img src={preview.url} alt={preview.name} />

                              <button
                                type="button"
                                className="progress-preview-remove"
                                onClick={() => removeSelectedFile(index)}
                                disabled={submitting}
                                aria-label={`Remove ${preview.name}`}
                              >
                                <X size={15} />
                              </button>

                              <div className="progress-preview-info">
                                <span title={preview.name}>{preview.name}</span>

                                <small>
                                  {(preview.size / (1024 * 1024)).toFixed(2)} MB
                                </small>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          className="progress-clear-photos"
                          onClick={() => setSelectedFiles([])}
                          disabled={submitting}
                        >
                          Remove all new photographs
                        </button>
                      </div>
                    )}
                  </div>

                  {formError && (
                    <div
                      className="progress-alert progress-alert-error progress-form-alert"
                      role="alert"
                    >
                      <AlertCircle size={19} />

                      <div>
                        <strong>
                          {editingUpdateId
                            ? "Changes not saved"
                            : "Report not submitted"}
                        </strong>

                        <p>{formError}</p>
                      </div>
                    </div>
                  )}

                  {successMessage && (
                    <div
                      className="progress-alert progress-alert-success progress-form-alert"
                      role="status"
                    >
                      <CheckCircle2 size={19} />

                      <div>
                        <strong>
                          {editingUpdateId
                            ? "Report updated"
                            : "Report submitted"}
                        </strong>

                        <p>{successMessage}</p>
                      </div>
                    </div>
                  )}

                  <div className="progress-form-actions">
                    <p>
                      <span>*</span> Required fields must be completed.
                    </p>

                    <div className="progress-form-action-buttons">
                      <button
                        type="button"
                        className="progress-button progress-button-secondary"
                        onClick={editingUpdateId ? cancelEditing : resetForm}
                        disabled={submitting}
                      >
                        {editingUpdateId ? "Cancel editing" : "Clear form"}
                      </button>

                      <button
                        type="submit"
                        className="progress-button progress-button-primary"
                        disabled={submitting || !selectedProjectId}
                      >
                        {submitting ? (
                          <>
                            <LoaderCircle size={17} className="spin" />
                            {editingUpdateId
                              ? "Saving changes..."
                              : "Submitting..."}
                          </>
                        ) : editingUpdateId ? (
                          <>
                            <CheckCircle2 size={17} />
                            Save changes
                          </>
                        ) : (
                          <>
                            <Send size={17} />
                            Submit report
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <aside className="progress-side-column">
                <section className="progress-card progress-side-card">
                  <div className="progress-side-heading">
                    <div className="progress-side-icon">
                      <Building2 size={19} />
                    </div>

                    <h3>Project at a glance</h3>
                  </div>

                  <div className="progress-side-project-name">
                    {getProjectName(selectedProject)}
                  </div>

                  {getProjectLocation(selectedProject) && (
                    <div className="progress-side-location">
                      <MapPin size={15} />
                      <span>{getProjectLocation(selectedProject)}</span>
                    </div>
                  )}

                  <div className="progress-side-metric">
                    <div>
                      <span>Current completion</span>
                      <strong>{currentProgress}%</strong>
                    </div>

                    <ProgressBar value={currentProgress} />
                  </div>

                  <div className="progress-side-details">
                    <div>
                      <span>Project status</span>
                      <strong>{getProjectStatus(selectedProject)}</strong>
                    </div>

                    <div>
                      <span>Reports submitted</span>
                      <strong>{completedReports}</strong>
                    </div>

                    <div>
                      <span>Latest report</span>
                      <strong>{latestReportDate}</strong>
                    </div>
                  </div>

                  {latestUpdate && (
                    <div className="progress-side-latest">
                      <span>LAST REPORTED WORK</span>

                      <strong>{getUpdateDescription(latestUpdate)}</strong>

                      <p>
                        {getWorkCompleted(latestUpdate).slice(0, 130)}
                        {getWorkCompleted(latestUpdate).length > 130
                          ? "..."
                          : ""}
                      </p>
                    </div>
                  )}
                </section>

                <section className="progress-card progress-tips-card">
                  <div className="progress-side-heading">
                    <div className="progress-side-icon progress-side-icon-amber">
                      <CheckCircle2 size={19} />
                    </div>

                    <h3>Reporting checklist</h3>
                  </div>

                  <p className="progress-tips-intro">
                    A useful daily report should cover these points.
                  </p>

                  <ul className="progress-checklist">
                    <li>
                      <span>
                        <CheckCircle2 size={15} />
                      </span>

                      <div>
                        <strong>Accurate work summary</strong>
                        <p>Describe what was actually completed.</p>
                      </div>
                    </li>

                    <li>
                      <span>
                        <CheckCircle2 size={15} />
                      </span>

                      <div>
                        <strong>Correct completion level</strong>
                        <p>Keep the overall percentage realistic.</p>
                      </div>
                    </li>

                    <li>
                      <span>
                        <CheckCircle2 size={15} />
                      </span>

                      <div>
                        <strong>Clear site photographs</strong>
                        <p>Capture the work from useful angles.</p>
                      </div>
                    </li>

                    <li>
                      <span>
                        <CheckCircle2 size={15} />
                      </span>

                      <div>
                        <strong>Issues and delays</strong>
                        <p>Record anything that needs attention.</p>
                      </div>
                    </li>
                  </ul>
                </section>

                <section className="progress-side-note">
                  <div className="progress-side-note-icon">
                    <CalendarDays size={19} />
                  </div>

                  <div>
                    <strong>Consistency matters</strong>

                    <p>
                      Regular reports make it easier to track site activity and
                      spot delays early.
                    </p>
                  </div>
                </section>
              </aside>
            </section>

            <section className="progress-history-section">
              <div className="progress-history-header">
                <div>
                  <div className="progress-history-eyebrow">
                    PROJECT RECORDS
                  </div>

                  <h2>Progress history</h2>

                  <p>
                    Review, edit, and manage previous reports and photographs.
                  </p>
                </div>

                <div className="progress-history-count">
                  <ClipboardCheck size={17} />

                  <span>
                    {completedReports}{" "}
                    {completedReports === 1 ? "report" : "reports"}
                  </span>
                </div>
              </div>

              {loadingUpdates ? (
                <div className="progress-card progress-history-loading">
                  <LoaderCircle className="spin" size={25} />
                  <p>Loading progress history...</p>
                </div>
              ) : sortedUpdates.length === 0 ? (
                <div className="progress-card">
                  <EmptyState
                    icon={ClipboardCheck}
                    title="No progress reports yet"
                    description="Your first daily report will appear here after you submit it."
                  />
                </div>
              ) : (
                <div className="progress-history-list">
                  {sortedUpdates.map((update, index) => {
                    const updateId = getUpdateId(update);
                    const images = getProgressImages(update);
                    const updateProgress = getUpdateProgress(update);
                    const updateWork = getWorkCompleted(update);
                    const updateDescription = getUpdateDescription(update);

                    const previousUpdate = sortedUpdates[index + 1] || null;

                    const previousProgress = previousUpdate
                      ? getUpdateProgress(previousUpdate)
                      : null;

                    const delta =
                      previousProgress === null
                        ? null
                        : updateProgress - previousProgress;

                    const isEditingThisReport = editingUpdateId === updateId;

                    return (
                      <article
                        className={`progress-history-card ${
                          isEditingThisReport ? "is-being-edited" : ""
                        }`}
                        key={updateId || `${getUpdateDate(update)}-${index}`}
                      >
                        <div className="progress-history-card-date">
                          <div className="progress-history-date-icon">
                            <CalendarDays size={18} />
                          </div>

                          <div>
                            <strong>
                              {formatDateLong(getUpdateDate(update))}
                            </strong>

                            <span>
                              {index === 0
                                ? "Latest report"
                                : `Report #${sortedUpdates.length - index}`}
                            </span>
                          </div>
                        </div>

                        <div className="progress-history-card-main">
                          <div className="progress-history-report-heading">
                            <div>
                              <h3>{updateDescription}</h3>

                              {update.createdAt && (
                                <span className="progress-history-created">
                                  Recorded {formatDateTime(update.createdAt)}
                                </span>
                              )}
                            </div>

                            <div className="progress-history-percentage">
                              <strong>{updateProgress}%</strong>
                              <span>completion</span>
                            </div>
                          </div>

                          <div className="progress-history-card-actions">
                            <button
                              type="button"
                              className="progress-button progress-button-secondary progress-edit-button"
                              onClick={() => startEditing(update)}
                              disabled={submitting}
                            >
                              <Edit3 size={16} />

                              {isEditingThisReport
                                ? "Currently editing"
                                : "Edit report"}
                            </button>

                            {isEditingThisReport && (
                              <span className="progress-editing-indicator">
                                <span />
                                Editing this report
                              </span>
                            )}
                          </div>

                          <ProgressBar value={updateProgress} />

                          {delta !== null && (
                            <div
                              className={`progress-history-delta ${
                                delta > 0
                                  ? "progress-delta-positive"
                                  : delta < 0
                                    ? "progress-delta-negative"
                                    : "progress-delta-neutral"
                              }`}
                            >
                              {delta > 0 ? (
                                <ArrowUpRight size={15} />
                              ) : delta < 0 ? (
                                <ArrowDownRight size={15} />
                              ) : null}

                              <span>
                                {delta > 0
                                  ? `Up ${delta}% from previous report`
                                  : delta < 0
                                    ? `Down ${Math.abs(delta)}% from previous report`
                                    : "No change from previous report"}
                              </span>
                            </div>
                          )}

                          {updateWork && (
                            <div className="progress-history-work">
                              <h4>Work completed</h4>
                              <p>{updateWork}</p>
                            </div>
                          )}

                          {images.length > 0 && (
                            <div className="progress-history-gallery-section">
                              <div className="progress-gallery-heading">
                                <div>
                                  <ImagePlus size={16} />
                                  <strong>Site photographs</strong>
                                </div>

                                <span>
                                  {images.length}{" "}
                                  {images.length === 1 ? "photo" : "photos"}
                                </span>
                              </div>

                              <div className="progress-history-gallery">
                                {images.map((image, imageIndex) => (
                                  <ProgressImage
                                    key={
                                      getImageId(image) ||
                                      `${updateId}-image-${imageIndex}`
                                    }
                                    image={image}
                                    index={imageIndex}
                                    onOpen={openLightbox}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        <footer className="progress-page-footer">
          <span>BUILDER360</span>
          <span>Daily site reporting</span>
        </footer>
      </div>

      {lightbox && (
        <div
          className="progress-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Site photograph viewer"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="progress-lightbox-close"
            onClick={() => setLightbox(null)}
            aria-label="Close image viewer"
          >
            <X size={23} />
          </button>

          <div
            className="progress-lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <img src={lightbox.src} alt={lightbox.name} />

            <div className="progress-lightbox-caption">{lightbox.name}</div>
          </div>
        </div>
      )}
    </main>
  );
}
