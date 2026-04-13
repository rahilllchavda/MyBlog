import { useState, useMemo, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useApp } from "../context/useApp";
import { createBooking, validateCoupon } from "../services/api";
import {
  MapPin,
  Moon,
  Tag,
  CheckCircle,
  ArrowLeft,
  CalendarDays,
  ShieldCheck,
  CreditCard,
  BadgeCheck,
  LoaderCircle,
  UserRound,
  Mail,
  Phone,
  Home,
  Receipt,
} from "lucide-react";
import toast from "react-hot-toast";

function Field({ label, error, hint, icon, optional = false, children }) {
  return (
    <div className={`form-field ${error ? "has-error" : ""}`}>
      <label>
        {icon}
        {label}
        {optional && <span className="field-optional">Optional</span>}
      </label>
      {children}
      {error && <span className="field-error">{error}</span>}
      {!error && hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}

export default function BookingPage() {
  const navigate = useNavigate();
  const { selectedCamp, setConfirmedBooking } = useApp();
  const checkIn = selectedCamp?.checkIn ?? "";
  const checkOut = selectedCamp?.checkOut ?? "";
  const pricePerNight = selectedCamp?.pricePerNight ?? 0;
  const name = selectedCamp?.name ?? "";
  const location = selectedCamp?.location ?? "";
  const imageUrl = selectedCamp?.imageUrl ?? "";

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

  const nights = useMemo(
    () =>
      Math.max(
        1,
        Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000),
      ),
    [checkIn, checkOut],
  );
  const subTotal = useMemo(
    () => selectedCamp?.totalPrice ?? pricePerNight * nights,
    [selectedCamp?.totalPrice, pricePerNight, nights],
  );
  const discount = coupon?.discountValue ?? 0;
  const total = Math.max(0, subTotal - discount);
  const hasDynamicPricing =
    selectedCamp?.totalPrice &&
    selectedCamp.totalPrice !== pricePerNight * nights;

  useEffect(() => {
    if (!coupon) return;
    if (coupon.code !== form.couponCode.trim().toUpperCase()) {
      setCoupon(null);
    }
  }, [form.couponCode, coupon]);

  if (!selectedCamp) {
    return <Navigate to="/" replace />;
  }

  const set = (k) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
    if (errors[k]) {
      setErrors((prev) => ({ ...prev, [k]: undefined }));
    }
  };

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

  const focusFirstError = () => {
    setTimeout(() => {
      document
        .querySelector(
          ".form-field.has-error input, .form-field.has-error select, .form-field.has-error textarea",
        )
        ?.focus();
    }, 0);
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the errors before submitting.");
      focusFirstError();
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
            <ArrowLeft size={15} /> Back
          </button>
          <div className="booking-page-header">
            <div>
              <h1 className="page-title">Complete Your Booking</h1>
              <p className="page-sub booking-subtitle">
                Secure your stay in under a minute with instant confirmation.
              </p>
            </div>
            <div className="booking-top-badge">
              <ShieldCheck size={15} /> Secure reservation
            </div>
          </div>

          <div className="booking-trip-card">
            <div className="booking-trip-item">
              <CalendarDays size={16} />
              <div>
                <span>Selected stay</span>
                <strong>
                  {fmtDate(checkIn)} → {fmtDate(checkOut)}
                </strong>
              </div>
            </div>
            <div className="booking-trip-item">
              <Moon size={16} />
              <div>
                <span>Duration</span>
                <strong>
                  {nights} night{nights > 1 ? "s" : ""}
                </strong>
              </div>
            </div>
          </div>

          <form className="form-card booking-form-card" onSubmit={handleSubmit}>
            <h3 className="form-section-title">Guest Details</h3>
            <div className="form-row">
              <Field
                label="First Name"
                error={errors.guestFirstName}
                icon={<UserRound size={14} />}
              >
                <input
                  value={form.guestFirstName}
                  onChange={set("guestFirstName")}
                  placeholder="John"
                  autoComplete="given-name"
                />
              </Field>
              <Field
                label="Last Name"
                error={errors.guestLastName}
                icon={<UserRound size={14} />}
              >
                <input
                  value={form.guestLastName}
                  onChange={set("guestLastName")}
                  placeholder="Doe"
                  autoComplete="family-name"
                />
              </Field>
            </div>
            <div className="form-row">
              <Field
                label="Email Address"
                error={errors.guestEmail}
                icon={<Mail size={14} />}
                hint="We'll send your booking confirmation here."
              >
                <input
                  type="email"
                  value={form.guestEmail}
                  onChange={set("guestEmail")}
                  placeholder="john@example.com"
                  autoComplete="email"
                />
              </Field>
              <Field
                label="Cell Phone"
                error={errors.guestPhone}
                icon={<Phone size={14} />}
                hint="Used only for check-in coordination."
              >
                <input
                  value={form.guestPhone}
                  onChange={set("guestPhone")}
                  placeholder="+1 234 567 8900"
                  autoComplete="tel"
                />
              </Field>
            </div>

            <h3 className="form-section-title" style={{ marginTop: "1.5rem" }}>
              Billing Address
            </h3>
            <Field
              label="Street Address"
              error={errors.billingAddress}
              icon={<Home size={14} />}
            >
              <input
                value={form.billingAddress}
                onChange={set("billingAddress")}
                placeholder="123 Main Street"
                autoComplete="street-address"
              />
            </Field>
            <div className="form-row">
              <Field label="City" error={errors.city} icon={<Home size={14} />}>
                <input
                  value={form.city}
                  onChange={set("city")}
                  placeholder="New York"
                  autoComplete="address-level2"
                />
              </Field>
              <Field
                label="ZIP Code"
                error={errors.zipCode}
                icon={<Home size={14} />}
              >
                <input
                  value={form.zipCode}
                  onChange={set("zipCode")}
                  placeholder="10001"
                  autoComplete="postal-code"
                />
              </Field>
            </div>
            <Field
              label="Country"
              error={errors.country}
              icon={<Home size={14} />}
            >
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
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleCoupon}
                  disabled={couponLoading || !form.couponCode.trim()}
                >
                  {couponLoading ? (
                    <>
                      <LoaderCircle size={16} className="spinner" /> Checking...
                    </>
                  ) : (
                    "Apply"
                  )}
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
          </form>

          <div className="booking-assurance-grid">
            <div className="booking-assurance-item">
              <ShieldCheck size={16} />
              <div>
                <strong>Secure reservation</strong>
                <span>Your details stay protected.</span>
              </div>
            </div>
            <div className="booking-assurance-item">
              <BadgeCheck size={16} />
              <div>
                <strong>Instant confirmation</strong>
                <span>Reference number generated immediately.</span>
              </div>
            </div>
            <div className="booking-assurance-item">
              <CreditCard size={16} />
              <div>
                <strong>Pay at check-in</strong>
                <span>No online payment friction.</span>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <LoaderCircle size={18} className="spinner" /> Processing your
                booking...
              </>
            ) : (
              `Confirm Booking · $${total.toFixed(2)}`
            )}
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
              <div className="summary-pill-row">
                <span className="summary-pill">
                  <Receipt size={12} /> Reservation summary
                </span>
                {hasDynamicPricing && (
                  <span className="summary-pill summary-pill-accent">
                    Dynamic pricing applied
                  </span>
                )}
              </div>
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
                  {hasDynamicPricing && (
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
