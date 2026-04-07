import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useApp } from "../context/useApp";
import { createBooking, validateCoupon } from "../services/api";
import { MapPin, Moon, Tag, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

function Field({ label, error, children }) {
  return (
    <div className={`form-field ${error ? "has-error" : ""}`}>
      <label>{label}</label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export default function BookingPage() {
  const navigate = useNavigate();
  const { selectedCamp, setConfirmedBooking } = useApp();

  const [form, setForm] = useState({
    guestFirstName: "",
    guestLastName: "",
    guestEmail: "",
    guestPhone: "",
    billingAddress: "",
    city: "",
    zipCode: "",
    country: "",
    couponCode: "",
  });
  const [errors, setErrors] = useState({});
  const [coupon, setCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!selectedCamp) {
    return <Navigate to="/" replace />;
  }

  const { checkIn, checkOut, pricePerNight, name, location, imageUrl } =
    selectedCamp;
  const nights = Math.round(
    (new Date(checkOut) - new Date(checkIn)) / 86400000,
  );
  // Use pre-calculated dynamic total from API (accounts for weekend pricing)
  const subTotal = selectedCamp.totalPrice ?? pricePerNight * nights;
  const discount = coupon?.discountValue ?? 0;
  const total = subTotal - discount;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.guestFirstName.trim())
      e.guestFirstName = "First name is required";
    if (!form.guestLastName.trim()) e.guestLastName = "Last name is required";
    if (!form.guestEmail.trim() || !/\S+@\S+\.\S+/.test(form.guestEmail))
      e.guestEmail = "Valid email is required";
    if (
      !form.guestPhone.trim() ||
      !/^\+?[\d\s\-()]{7,15}$/.test(form.guestPhone)
    )
      e.guestPhone = "Valid phone number is required";
    if (!form.billingAddress.trim()) e.billingAddress = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.zipCode.trim()) e.zipCode = "ZIP code is required";
    if (!form.country.trim()) e.country = "Country is required";
    return e;
  };

  const handleCoupon = async () => {
    if (!form.couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await validateCoupon({
        couponCode: form.couponCode.toUpperCase(),
        numberOfNights: nights,
      });
      if (res.data.isValid) {
        setCoupon(res.data);
        toast.success(`Coupon applied! You save $${res.data.discountValue}`);
      } else {
        toast.error(res.data.message);
        setCoupon(null);
      }
    } catch {
      toast.error("Failed to validate coupon.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error("Please fix the errors before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        campId: selectedCamp.id,
        checkIn,
        checkOut,
        ...form,
        couponCode: coupon ? form.couponCode.toUpperCase() : null,
      };
      const res = await createBooking(payload);
      setConfirmedBooking(res.data);
      toast.success("Booking confirmed!");
      navigate("/confirmation");
    } catch (err) {
      toast.error(
        err.response?.data?.message ?? "Booking failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="booking-page">
      <div className="booking-layout">
        {/* LEFT — Form */}
        <div className="booking-form-section">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="page-title">Complete Your Booking</h1>

          <div className="form-card">
            <h3 className="form-section-title">Guest Details</h3>
            <div className="form-row">
              <Field label="First Name" error={errors.guestFirstName}>
                <input
                  value={form.guestFirstName}
                  onChange={set("guestFirstName")}
                  placeholder="John"
                />
              </Field>
              <Field label="Last Name" error={errors.guestLastName}>
                <input
                  value={form.guestLastName}
                  onChange={set("guestLastName")}
                  placeholder="Doe"
                />
              </Field>
            </div>
            <div className="form-row">
              <Field label="Email Address" error={errors.guestEmail}>
                <input
                  type="email"
                  value={form.guestEmail}
                  onChange={set("guestEmail")}
                  placeholder="john@example.com"
                />
              </Field>
              <Field label="Cell Phone" error={errors.guestPhone}>
                <input
                  value={form.guestPhone}
                  onChange={set("guestPhone")}
                  placeholder="+1 234 567 8900"
                />
              </Field>
            </div>

            <h3 className="form-section-title" style={{ marginTop: "1.5rem" }}>
              Billing Address
            </h3>
            <Field label="Street Address" error={errors.billingAddress}>
              <input
                value={form.billingAddress}
                onChange={set("billingAddress")}
                placeholder="123 Main Street"
              />
            </Field>
            <div className="form-row">
              <Field label="City" error={errors.city}>
                <input
                  value={form.city}
                  onChange={set("city")}
                  placeholder="New York"
                />
              </Field>
              <Field label="ZIP Code" error={errors.zipCode}>
                <input
                  value={form.zipCode}
                  onChange={set("zipCode")}
                  placeholder="10001"
                />
              </Field>
            </div>
            <Field label="Country" error={errors.country}>
              <select value={form.country} onChange={set("country")}>
                <option value="">Select country</option>
                {[
                  "United States",
                  "Canada",
                  "United Kingdom",
                  "Australia",
                  "India",
                  "Germany",
                  "France",
                  "Other",
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            {/* Coupon */}
            <div className="coupon-section">
              <h3 className="form-section-title">
                <Tag size={16} /> Discount Coupon
              </h3>
              <div className="coupon-row">
                <input
                  value={form.couponCode}
                  onChange={set("couponCode")}
                  placeholder="Enter code (e.g. CAMP10)"
                  className="coupon-input"
                />
                <button
                  className="btn btn-outline"
                  onClick={handleCoupon}
                  disabled={couponLoading}
                >
                  {couponLoading ? "Checking..." : "Apply"}
                </button>
              </div>
              {coupon && (
                <div className="coupon-success">
                  <CheckCircle size={15} />
                  {coupon.message}
                </div>
              )}
              <p className="coupon-hint">Try: CAMP10 · CAMP25 · SUMMER50</p>
            </div>
          </div>

          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? "Processing..."
              : `Confirm Booking · $${total.toFixed(2)}`}
          </button>
          <p className="payment-note">
            💳 Payment collected at check-in. Free cancellation for future
            dates.
          </p>
        </div>

        {/* RIGHT — Summary */}
        <div className="booking-summary">
          <div className="summary-card sticky-card">
            <img
              src={imageUrl}
              alt={name}
              className="summary-img"
              onError={(e) => {
                e.target.src =
                  "https://placehold.co/400x250/1a3a2a/white?text=CampSite";
              }}
            />
            <div className="summary-body">
              <h3 className="summary-camp-name">{name}</h3>
              <div className="summary-location">
                <MapPin size={13} /> {location}
              </div>
              <div className="summary-divider" />
              <div className="summary-row">
                <span>Check-in</span>
                <strong>{fmtDate(checkIn)}</strong>
              </div>
              <div className="summary-row">
                <span>Check-out</span>
                <strong>{fmtDate(checkOut)}</strong>
              </div>
              <div className="summary-row">
                <span>
                  <Moon size={13} /> Duration
                </span>
                <strong>
                  {nights} night{nights > 1 ? "s" : ""}
                </strong>
              </div>
              <div className="summary-divider" />
              <div className="summary-row">
                <span>
                  ${pricePerNight} × {nights} nights
                  {selectedCamp.totalPrice &&
                    selectedCamp.totalPrice !== pricePerNight * nights && (
                      <span className="dynamic-pricing-note">
                        {" "}
                        (incl. weekend rates)
                      </span>
                    )}
                </span>
                <span>${subTotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="summary-row discount-row">
                  <span>Discount ({coupon?.code})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-divider" />
              <div className="summary-row total-row">
                <strong>Total Due at Check-in</strong>
                <strong>${total.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
