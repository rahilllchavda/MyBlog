import { Fragment, useState, useEffect } from "react";
import { getCamps, createCamp, updateCamp, deleteCamp } from "../services/api";
import { Plus, Edit2, Trash2, X, Save, Loader } from "lucide-react";
import toast from "react-hot-toast";

const BLANK = {
  name: "",
  description: "",
  location: "",
  imageUrl: "",
  capacity: 2,
  pricePerNight: 85,
  weekendPricePerNight: "",
  isActive: true,
};

function CampForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.description.trim()) e.description = "Required";
    if (!form.location.trim()) e.location = "Required";
    if (!form.imageUrl.trim()) e.imageUrl = "Required";
    if (!form.capacity || form.capacity < 1) e.capacity = "Min 1";
    if (!form.pricePerNight || form.pricePerNight < 1)
      e.pricePerNight = "Must be > 0";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setSaving(true);
    try {
      await onSave({
        ...form,
        capacity: Number(form.capacity),
        pricePerNight: Number(form.pricePerNight),
        weekendPricePerNight: form.weekendPricePerNight
          ? Number(form.weekendPricePerNight)
          : null,
      });
    } finally {
      setSaving(false);
    }
  };

  const F = ({ k, label, type = "text", placeholder = "" }) => (
    <div className={`form-field ${errors[k] ? "has-error" : ""}`}>
      <label>{label}</label>
      <input
        type={type}
        value={form[k]}
        onChange={set(k)}
        placeholder={placeholder}
      />
      {errors[k] && <span className="field-error">{errors[k]}</span>}
    </div>
  );

  return (
    <div className="camp-form-card">
      <div className="form-row">
        <F k="name" label="Camp Name" placeholder="Pinewood Haven" />
        <F k="location" label="Location" placeholder="Blue Ridge, NC" />
      </div>
      <div className={`form-field ${errors.description ? "has-error" : ""}`}>
        <label>Description</label>
        <textarea
          value={form.description}
          onChange={set("description")}
          rows={3}
          placeholder="Describe the campsite..."
        />
        {errors.description && (
          <span className="field-error">{errors.description}</span>
        )}
      </div>
      <div className={`form-field ${errors.imageUrl ? "has-error" : ""}`}>
        <label>Image URL</label>
        <input
          value={form.imageUrl}
          onChange={set("imageUrl")}
          placeholder="https://..."
        />
        {errors.imageUrl && (
          <span className="field-error">{errors.imageUrl}</span>
        )}
      </div>
      <div className="form-row">
        <F k="capacity" label="Capacity" type="number" placeholder="4" />
        <F
          k="pricePerNight"
          label="Price/Night ($)"
          type="number"
          placeholder="85"
        />
        <F
          k="weekendPricePerNight"
          label="Weekend Price ($)"
          type="number"
          placeholder="Optional"
        />
      </div>
      <div className="form-field">
        <label>
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) =>
              setForm((f) => ({ ...f, isActive: e.target.checked }))
            }
          />{" "}
          Active (visible on dashboard)
        </label>
      </div>
      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onCancel}>
          <X size={15} /> Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader size={15} className="spinner" />
          ) : (
            <Save size={15} />
          )}
          {saving ? "Saving..." : "Save Camp"}
        </button>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCamp, setEditCamp] = useState(null);

  const loadCamps = async () => {
    setLoading(true);
    try {
      const res = await getAllCampsAdmin();
      setCamps(res.data ?? []);
    } catch {
      toast.error("Failed to load camps.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCamps();
  }, []);

  const handleCreate = async (data) => {
    try {
      await createCamp(data);
      toast.success("Camp added successfully!");
      setShowForm(false);
      loadCamps();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to add camp.");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateCamp(editCamp.id, data);
      toast.success("Camp updated successfully!");
      setEditCamp(null);
      loadCamps();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to update camp.");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteCamp(id);
      toast.success(`"${name}" deleted.`);
      loadCamps();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to delete camp.");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1 className="page-title">Manage Camps</h1>
          <p className="page-sub">{camps.length} camps in the system</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditCamp(null);
          }}
        >
          <Plus size={16} /> Add New Camp
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "1rem", fontWeight: 600 }}>
            Add New Camp
          </h3>
          <CampForm
            initial={BLANK}
            onSave={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <Loader size={36} className="spinner" />
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Camp</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Rate/Night</th>
                <th>Weekend</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {camps.map((camp) => (
                <Fragment key={camp.id}>
                  <tr>
                    <td>
                      <div className="admin-camp-cell">
                        <img
                          src={camp.imageUrl}
                          alt={camp.name}
                          className="admin-camp-thumb"
                          onError={(e) => {
                            e.target.src =
                              "https://placehold.co/60x40/1a3a2a/white?text=Camp";
                          }}
                        />
                        <div>
                          <div className="admin-camp-name">{camp.name}</div>
                          <div className="admin-camp-desc">
                            {camp.description.substring(0, 60)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{camp.location}</td>
                    <td>{camp.capacity} guests</td>
                    <td>${camp.pricePerNight}</td>
                    <td>
                      {camp.weekendPricePerNight
                        ? `$${camp.weekendPricePerNight}`
                        : "—"}
                    </td>
                    <td>
                      {camp.averageRating > 0
                        ? `⭐ ${camp.averageRating} (${camp.totalRatings})`
                        : "—"}
                    </td>
                    <td>
                      <span
                        className={`status-badge status-${
                          camp.isActive ? "active" : "inactive"
                        }`}
                      >
                        {camp.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            setEditCamp(camp);
                            setShowForm(false);
                          }}
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(camp.id, camp.name)}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editCamp?.id === camp.id && (
                    <tr>
                      <td
                        colSpan={8}
                        style={{ padding: "1rem", background: "var(--bg-2)" }}
                      >
                        <CampForm
                          initial={{
                            ...camp,
                            weekendPricePerNight:
                              camp.weekendPricePerNight ?? "",
                          }}
                          onSave={handleUpdate}
                          onCancel={() => setEditCamp(null)}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
