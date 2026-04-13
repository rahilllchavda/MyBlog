import { useState, useEffect } from "react";
import {
  getAdminCamps,
  createCamp,
  updateCamp,
  deleteCamp,
} from "../services/api";
import api from "../services/api";
import {
  LayoutDashboard,
  Tent,
  Tag,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader,
  TrendingUp,
  Users,
  Star,
  DollarSign,
  CheckCircle,
  XCircle,
  Settings,
  BarChart2,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// ── Stat Card ─────────────────────────────────────────────
function StatCard({ icon, label, value, color, change }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color }}>
        {icon}
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {change && <div className="stat-change up">{change}</div>}
      </div>
    </div>
  );
}

function CampInputField({
  field,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder = "",
  hint = "",
  min,
  step,
  max,
}) {
  return (
    <div className={`form-field ${error ? "has-error" : ""}`}>
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        min={min}
        step={step}
        max={max}
      />
      {hint && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">⚠ {error}</span>}
    </div>
  );
}

function CampDeleteDialog({ campName, onConfirm, onCancel, deleting }) {
  return (
    <div className="camp-modal-backdrop" onClick={onCancel}>
      <div className="camp-delete-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>Delete Camp</h3>
        <p>
          Are you sure you want to delete <strong>{campName}</strong>? This
          action cannot be undone.
        </p>
        <div className="camp-delete-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Camp"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CampCardSkeleton() {
  return (
    <div className="admin-camp-card admin-camp-card-skeleton">
      <div className="skeleton" style={{ height: 170, borderRadius: 12 }} />
      <div className="admin-camp-card-body">
        <div
          className="skeleton"
          style={{ height: 18, width: "55%", marginBottom: 10 }}
        />
        <div
          className="skeleton"
          style={{ height: 12, width: "40%", marginBottom: 14 }}
        />
        <div
          className="skeleton"
          style={{ height: 12, width: "100%", marginBottom: 6 }}
        />
        <div
          className="skeleton"
          style={{ height: 12, width: "75%", marginBottom: 14 }}
        />
      </div>
    </div>
  );
}

// ── Camp Form ─────────────────────────────────────────────
function CampForm({ initial, onSave, onCancel, title }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setForm(initial);
    setErrors({});
    setImageError(false);
  }, [initial, title]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (field === "imageUrl") {
      setImageError(false);
    }
  };

  const mapApiValidationErrors = (apiErrorPayload) => {
    const modelErrors = apiErrorPayload?.errors;
    if (!modelErrors || typeof modelErrors !== "object") return {};

    const mapped = {};
    Object.entries(modelErrors).forEach(([key, value]) => {
      const normalizedKey = key.charAt(0).toLowerCase() + key.slice(1);
      mapped[normalizedKey] = Array.isArray(value) ? value[0] : String(value);
    });

    return mapped;
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Camp name is required.";
    if (form.name.trim().length > 100)
      e.name = "Camp name cannot exceed 100 characters.";

    if (!form.description.trim()) e.description = "Description is required.";
    if (form.description.trim().length > 500)
      e.description = "Description cannot exceed 500 characters.";

    if (!form.location.trim()) e.location = "Location is required.";
    if (form.location.trim().length > 120)
      e.location = "Location cannot exceed 120 characters.";

    if (!form.imageUrl.trim()) {
      e.imageUrl = "Image URL is required.";
    } else {
      try {
        const parsed = new URL(form.imageUrl.trim());
        if (!["http:", "https:"].includes(parsed.protocol)) {
          e.imageUrl = "Image URL must start with http:// or https://.";
        }
      } catch {
        e.imageUrl = "Image URL must be valid.";
      }
    }

    if (!form.capacity || Number(form.capacity) < 1)
      e.capacity = "Capacity must be at least 1.";
    if (Number(form.capacity) > 100) e.capacity = "Capacity cannot exceed 100.";

    if (!form.pricePerNight || Number(form.pricePerNight) < 1)
      e.pricePerNight = "Weekday price must be greater than 0.";

    if (
      form.weekendPricePerNight === "" ||
      form.weekendPricePerNight === null ||
      form.weekendPricePerNight === undefined
    ) {
      e.weekendPricePerNight = "Weekend price is required.";
    } else if (Number(form.weekendPricePerNight) <= 0) {
      e.weekendPricePerNight = "Weekend price must be greater than 0.";
    }

    return e;
  };

  const handleSave = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error("Fix all errors before saving.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        ...form,
        capacity: Number(form.capacity),
        pricePerNight: Number(form.pricePerNight),
        weekendPricePerNight: Number(form.weekendPricePerNight),
        isActive: form.isActive === true || form.isActive === "true",
      });
    } catch (err) {
      const apiErrors = mapApiValidationErrors(err?.response?.data);
      if (Object.keys(apiErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...apiErrors }));
      } else {
        toast.error(err?.response?.data?.message ?? "Failed to save camp.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="camp-form-card">
      <div className="camp-form-header">
        <h3>{title}</h3>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>
          <X size={14} /> Cancel
        </button>
      </div>
      <div className="form-row">
        <CampInputField
          field="name"
          label="Camp Name *"
          value={form.name}
          onChange={setField}
          error={errors.name}
          placeholder="e.g. Pinewood Haven"
        />
        <CampInputField
          field="location"
          label="Location *"
          value={form.location}
          onChange={setField}
          error={errors.location}
          placeholder="e.g. Blue Ridge, NC"
        />
      </div>
      <div className="form-field" style={{ marginBottom: 16 }}>
        <label>Description *</label>
        <textarea
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          rows={3}
          placeholder="Describe the campsite experience..."
          style={{ borderColor: errors.description ? "var(--red)" : "" }}
        />
        {errors.description && (
          <span className="field-error">⚠ {errors.description}</span>
        )}
      </div>
      <div className="form-field" style={{ marginBottom: 16 }}>
        <label>Image URL *</label>
        <input
          value={form.imageUrl}
          onChange={(e) => setField("imageUrl", e.target.value)}
          placeholder="https://images.unsplash.com/..."
          style={{ borderColor: errors.imageUrl ? "var(--red)" : "" }}
        />
        {errors.imageUrl && (
          <span className="field-error">⚠ {errors.imageUrl}</span>
        )}
        {form.imageUrl && (
          <img
            src={form.imageUrl}
            alt="preview"
            className="img-preview"
            style={{ display: imageError ? "none" : "block" }}
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        )}
        {imageError && (
          <span className="field-error">⚠ Unable to load image preview.</span>
        )}
      </div>
      <div className="form-row-three">
        <CampInputField
          field="capacity"
          label="Capacity (guests) *"
          value={form.capacity}
          onChange={setField}
          error={errors.capacity}
          type="number"
          placeholder="4"
          min="1"
          max="100"
        />
        <CampInputField
          field="pricePerNight"
          label="Weekday Price/Night ($) *"
          value={form.pricePerNight}
          onChange={setField}
          error={errors.pricePerNight}
          type="number"
          placeholder="85"
          hint="Mon–Thu"
          min="1"
          step="0.01"
        />
        <CampInputField
          field="weekendPricePerNight"
          label="Weekend Price/Night ($) *"
          value={form.weekendPricePerNight}
          onChange={setField}
          error={errors.weekendPricePerNight}
          type="number"
          placeholder="95"
          hint="Fri–Sun"
          min="1"
          step="0.01"
        />
      </div>
      <div className="form-field" style={{ marginBottom: 8 }}>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.isActive === true || form.isActive === "true"}
            onChange={(e) =>
              setForm((f) => ({ ...f, isActive: e.target.checked }))
            }
          />
          <span>Active — visible to guests on dashboard</span>
        </label>
      </div>
      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onCancel}>
          <X size={14} /> Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader size={14} className="spinner" /> Saving...
            </>
          ) : (
            <>
              <Save size={14} /> Save Camp
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Coupon Form ───────────────────────────────────────────
function CouponForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    code: "",
    discountValue: "",
    minimumNights: 1,
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.code.trim()) e.code = "Coupon code is required";
    if (form.code.length > 20) e.code = "Max 20 characters";
    if (!form.discountValue || Number(form.discountValue) <= 0)
      e.discountValue = "Discount must be greater than 0";
    if (!form.minimumNights || Number(form.minimumNights) < 1)
      e.minimumNights = "Minimum 1 night";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setSaving(true);
    try {
      await onSave({
        code: form.code.toUpperCase().trim(),
        discountValue: Number(form.discountValue),
        minimumNights: Number(form.minimumNights),
        isActive: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="camp-form-card">
      <div className="camp-form-header">
        <h3>Create New Coupon</h3>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>
          <X size={14} /> Cancel
        </button>
      </div>
      <div className="form-row">
        <div className={`form-field ${errors.code ? "has-error" : ""}`}>
          <label>Coupon Code *</label>
          <input
            value={form.code}
            onChange={(e) =>
              setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
            }
            placeholder="e.g. SUMMER20"
            style={{
              fontFamily: "DM Mono, monospace",
              letterSpacing: "0.08em",
            }}
          />
          {errors.code && <span className="field-error">⚠ {errors.code}</span>}
        </div>
        <div
          className={`form-field ${errors.discountValue ? "has-error" : ""}`}
        >
          <label>Discount Amount ($) *</label>
          <input
            type="number"
            value={form.discountValue}
            onChange={set("discountValue")}
            placeholder="e.g. 25"
          />
          {errors.discountValue && (
            <span className="field-error">⚠ {errors.discountValue}</span>
          )}
        </div>
      </div>
      <div className={`form-field ${errors.minimumNights ? "has-error" : ""}`}>
        <label>Minimum Nights Required *</label>
        <input
          type="number"
          value={form.minimumNights}
          onChange={set("minimumNights")}
          placeholder="1"
          min="1"
        />
        <span className="field-hint">
          Guest must book at least this many nights to use the coupon
        </span>
        {errors.minimumNights && (
          <span className="field-error">⚠ {errors.minimumNights}</span>
        )}
      </div>
      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onCancel}>
          <X size={14} /> Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader size={14} className="spinner" /> Creating...
            </>
          ) : (
            <>
              <Plus size={14} /> Create Coupon
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────
function OverviewTab({ camps, coupons }) {
  const totalCamps = camps.length;
  const activeCamps = camps.filter((c) => c.isActive).length;
  const avgRating = camps.length
    ? (
        camps.reduce((s, c) => s + (c.averageRating || 0), 0) / camps.length
      ).toFixed(1)
    : "—";
  const totalReviews = camps.reduce((s, c) => s + (c.totalRatings || 0), 0);
  const activeCoupons = coupons.filter((c) => c.isActive).length;

  return (
    <div>
      <div className="stats-grid">
        <StatCard
          icon={<Tent size={22} color="#fff" />}
          label="Total Camps"
          value={totalCamps}
          color="#1a3a2a"
          change="↑ All listings"
        />
        <StatCard
          icon={<CheckCircle size={22} color="#fff" />}
          label="Active Camps"
          value={activeCamps}
          color="#16a34a"
        />
        <StatCard
          icon={<Star size={22} color="#fff" />}
          label="Avg Rating"
          value={avgRating}
          color="#d97706"
        />
        <StatCard
          icon={<Users size={22} color="#fff" />}
          label="Total Reviews"
          value={totalReviews}
          color="#2563eb"
        />
        <StatCard
          icon={<Tag size={22} color="#fff" />}
          label="Active Coupons"
          value={activeCoupons}
          color="#7c3aed"
        />
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <span className="admin-table-title">📊 Camp Performance</span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Camp</th>
              <th>Location</th>
              <th>Capacity</th>
              <th>Weekday $</th>
              <th>Weekend $</th>
              <th>Rating</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {camps.map((camp) => (
              <tr key={camp.id}>
                <td>
                  <div className="admin-camp-cell">
                    <img
                      src={camp.imageUrl}
                      alt={camp.name}
                      className="admin-camp-thumb"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=60";
                      }}
                    />
                    <div>
                      <div className="admin-camp-name">{camp.name}</div>
                      <div className="admin-camp-desc">
                        {camp.description?.substring(0, 50)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ color: "var(--text-3)", fontSize: 13 }}>
                  {camp.location}
                </td>
                <td>
                  <span className="capacity-pill">👥 {camp.capacity}</span>
                </td>
                <td>
                  <span className="price-pill">${camp.pricePerNight}</span>
                </td>
                <td>
                  <span
                    className="price-pill"
                    style={{
                      color: camp.weekendPricePerNight
                        ? "var(--fire)"
                        : "var(--text-4)",
                    }}
                  >
                    {camp.weekendPricePerNight
                      ? `$${camp.weekendPricePerNight}`
                      : "—"}
                  </span>
                </td>
                <td>
                  {camp.averageRating > 0 ? (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontWeight: 500,
                      }}
                    >
                      ⭐ {camp.averageRating}{" "}
                      <span style={{ color: "var(--text-3)", fontSize: 12 }}>
                        ({camp.totalRatings})
                      </span>
                    </span>
                  ) : (
                    <span style={{ color: "var(--text-4)", fontSize: 13 }}>
                      No ratings yet
                    </span>
                  )}
                </td>
                <td>
                  <span
                    className={`status-badge status-${camp.isActive ? "active" : "inactive"}`}
                  >
                    {camp.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Camps Tab ─────────────────────────────────────────────
function CampsTab({ camps, onRefresh, loading }) {
  const [showModal, setShowModal] = useState(false);
  const [editingCamp, setEditingCamp] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const BLANK = {
    name: "",
    description: "",
    location: "",
    imageUrl: "",
    capacity: 2,
    pricePerNight: 85,
    weekendPricePerNight: 95,
    isActive: true,
  };

  const openCreate = () => {
    setEditingCamp(null);
    setShowModal(true);
  };

  const openEdit = (camp) => {
    setEditingCamp(camp);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCamp(null);
  };

  const refreshAfterMutation = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const handleCreate = async (data) => {
    await createCamp(data);
    toast.success("🏕 Camp added successfully!");
    closeModal();
    await refreshAfterMutation();
  };

  const handleUpdate = async (data) => {
    await updateCamp(editingCamp.id, data);
    toast.success("✅ Camp updated successfully!");
    closeModal();
    await refreshAfterMutation();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCamp(deleteTarget.id);
      toast.success(`🗑 "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      await refreshAfterMutation();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-camps-page">
      <div className="section-header">
        <div>
          <span className="section-title">Manage Camp</span>
          <p className="camp-section-sub">
            Create, update, and manage listing quality.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} /> Add New Camp
        </button>
      </div>

      <div className="admin-camp-grid">
        {(loading || refreshing) &&
          Array.from({ length: 6 }).map((_, i) => <CampCardSkeleton key={i} />)}

        {!loading && !refreshing && camps.length === 0 && (
          <div
            className="empty-state"
            style={{ padding: "3rem", gridColumn: "1 / -1" }}
          >
            <Tent size={48} strokeWidth={1} />
            <h3>No camps yet</h3>
            <p>Add your first premium campsite listing to get started.</p>
          </div>
        )}

        {!loading &&
          !refreshing &&
          camps.map((camp) => (
            <article className="admin-camp-card" key={camp.id}>
              <div className="admin-camp-visual">
                <img
                  src={camp.imageUrl}
                  alt={camp.name}
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/640x360/1a3a2a/ffffff?text=CampSite";
                  }}
                />
                <span
                  className={`status-badge status-${camp.isActive ? "active" : "inactive"}`}
                >
                  {camp.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="admin-camp-card-body">
                <div className="admin-camp-card-header">
                  <h3>{camp.name}</h3>
                  <span className="capacity-pill">👥 {camp.capacity}</span>
                </div>
                <p className="admin-camp-card-location">{camp.location}</p>
                <p className="admin-camp-card-desc">{camp.description}</p>

                <div className="admin-camp-pricing">
                  <span>Weekday ${camp.pricePerNight}</span>
                  <span>Weekend ${camp.weekendPricePerNight ?? "—"}</span>
                </div>

                <div className="admin-camp-rating">
                  {camp.averageRating > 0
                    ? `⭐ ${camp.averageRating} (${camp.totalRatings})`
                    : "No ratings yet"}
                </div>

                <div className="admin-camp-card-actions">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => openEdit(camp)}
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() =>
                      setDeleteTarget({ id: camp.id, name: camp.name })
                    }
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
      </div>

      {showModal && (
        <div className="camp-modal-backdrop" onClick={closeModal}>
          <div
            className="camp-modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <CampForm
              title={
                editingCamp ? `Edit Camp: ${editingCamp.name}` : "Add New Camp"
              }
              initial={
                editingCamp
                  ? {
                      name: editingCamp.name,
                      description: editingCamp.description,
                      location: editingCamp.location,
                      imageUrl: editingCamp.imageUrl,
                      capacity: editingCamp.capacity,
                      pricePerNight: editingCamp.pricePerNight,
                      weekendPricePerNight:
                        editingCamp.weekendPricePerNight ?? "",
                      isActive: editingCamp.isActive,
                    }
                  : BLANK
              }
              onSave={editingCamp ? handleUpdate : handleCreate}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}

      {deleteTarget && (
        <CampDeleteDialog
          campName={deleteTarget.name}
          deleting={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ── Coupons Tab ───────────────────────────────────────────
function CouponsTab({ coupons, onRefresh }) {
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async (data) => {
    try {
      await api.post("/coupons", data);
      toast.success("🎟 Coupon created successfully!");
      setShowForm(false);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to create coupon.");
    }
  };

  const handleToggle = async (coupon) => {
    try {
      await api.put(`/coupons/${coupon.id}`, {
        ...coupon,
        isActive: !coupon.isActive,
      });
      toast.success(
        `Coupon ${!coupon.isActive ? "activated" : "deactivated"}.`,
      );
      onRefresh();
    } catch {
      toast.error("Failed to update coupon.");
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success(`Coupon "${code}" deleted.`);
      onRefresh();
    } catch {
      toast.error("Failed to delete coupon.");
    }
  };

  return (
    <div>
      <div className="section-header">
        <span className="section-title">Discount Coupons</span>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={15} /> Create Coupon
        </button>
      </div>

      {showForm && (
        <CouponForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {coupons.length === 0 && !showForm && (
        <div className="empty-state" style={{ padding: "3rem" }}>
          <Tag size={48} strokeWidth={1} />
          <h3>No coupons yet</h3>
          <p>
            Create your first discount coupon to offer special deals to guests.
          </p>
        </div>
      )}

      <div className="coupon-grid">
        {coupons.map((coupon) => (
          <div className="coupon-card" key={coupon.id}>
            <div className="coupon-card-header">
              <div>
                <div className="coupon-code">{coupon.code}</div>
                <span
                  className={
                    coupon.isActive
                      ? "coupon-status-active"
                      : "coupon-status-inactive"
                  }
                >
                  {coupon.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="coupon-discount">${coupon.discountValue}</div>
            </div>
            <div className="coupon-card-body">
              <div className="coupon-detail">
                <span>Discount</span>
                <span>${coupon.discountValue} off</span>
              </div>
              <div className="coupon-detail">
                <span>Min. nights</span>
                <span>
                  {coupon.minimumNights} night
                  {coupon.minimumNights > 1 ? "s" : ""}
                </span>
              </div>
              <div className="coupon-detail">
                <span>Type</span>
                <span>Absolute value</span>
              </div>
            </div>
            <div className="coupon-card-footer">
              <button
                className={`btn btn-xs ${coupon.isActive ? "btn-ghost" : "btn-success"}`}
                onClick={() => handleToggle(coupon)}
              >
                {coupon.isActive ? (
                  <>
                    <XCircle size={12} /> Deactivate
                  </>
                ) : (
                  <>
                    <CheckCircle size={12} /> Activate
                  </>
                )}
              </button>
              <button
                className="btn btn-xs btn-danger"
                onClick={() => handleDelete(coupon.id, coupon.code)}
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Admin Panel ──────────────────────────────────────
export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [camps, setCamps] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadData = async () => {
    setLoading(true);
    try {
      const [campsRes, couponsRes] = await Promise.all([
        getAdminCamps(),
        api.get("/coupons").catch(() => ({ data: [] })),
      ]);
      setCamps(Array.isArray(campsRes.data) ? campsRes.data : []);
      setCoupons(Array.isArray(couponsRes.data) ? couponsRes.data : []);
    } catch {
      toast.error("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const navItems = [
    { id: "overview", icon: <LayoutDashboard size={17} />, label: "Overview" },
    {
      id: "camps",
      icon: <Tent size={17} />,
      label: "Manage Camp",
      badge: camps.length,
    },
    {
      id: "coupons",
      icon: <Tag size={17} />,
      label: "Coupons",
      badge: coupons.filter((c) => c.isActive).length,
    },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-title">Admin Panel</div>
          <div className="admin-sidebar-sub">Welcome, Admin</div>
        </div>
        <nav className="admin-nav">
          <div className="admin-nav-section">Management</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`admin-nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              {item.label}
              {item.badge !== undefined && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <button
            className="btn btn-ghost btn-sm btn-full"
            onClick={loadData}
            style={{
              color: "rgba(255,255,255,0.5)",
              borderColor: "rgba(255,255,255,0.15)",
              fontSize: 12,
            }}
          >
            <RefreshCw size={12} /> Refresh Data
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        {loading ? (
          <div className="loading-state">
            <div className="loading-dots">
              <div className="loading-dot" />
              <div className="loading-dot" />
              <div className="loading-dot" />
            </div>
            <p>Loading admin data...</p>
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <OverviewTab camps={camps} coupons={coupons} />
            )}
            {activeTab === "camps" && (
              <CampsTab camps={camps} onRefresh={loadData} loading={loading} />
            )}
            {activeTab === "coupons" && (
              <CouponsTab coupons={coupons} onRefresh={loadData} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
