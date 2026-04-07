import { useState } from "react";
import {
  getBooking,
  cancelBooking,
  addRating,
  updateRating,
} from "../services/api";
import { Search, Star, XCircle, MapPin, Moon } from "lucide-react";
import toast from "react-hot-toast";

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-picker">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={28}
          fill={(hover || value) >= n ? "#f59e0b" : "none"}
          stroke={(hover || value) >= n ? "#f59e0b" : "#9ca3af"}
          style={{ cursor: "pointer" }}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
        />
      ))}
    </div>
  );
}

export default function ManageBooking() {
  const [ref, setRef] = useState("");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const isFuture = (b) => {
    const checkIn = new Date(b.checkIn);
    checkIn.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkIn > today;
  };

  const isPast = (b) => {
    const checkOut = new Date(b.checkOut);
    checkOut.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkOut < today;
  };
  const hasRating = (b) => b.ratingStars != null;

  const handleSearch = async () => {
    if (!ref.trim()) {
      toast.error("Enter a reference number.");
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await getBooking(ref.trim().toUpperCase());
      setBooking(res.data);
      setStars(res.data.ratingStars ?? 0);
    } catch {
      setBooking(null);
      toast.error("Booking not found. Check your reference number.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;
    try {
      await cancelBooking(booking.referenceNumber);
      setBooking((b) => ({ ...b, status: "Cancelled" }));
      toast.success("Booking cancelled. The camp is now available again.");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Cancellation failed.");
    }
  };

  const handleRating = async () => {
    if (!stars) {
      toast.error("Please select a star rating.");
      return;
    }
    setRatingSubmitting(true);
    try {
      const payload = {
        referenceNumber: booking.referenceNumber,
        campId: booking.campId,
        stars,
        comment,
      };
      if (hasRating(booking)) {
        await updateRating(payload);
        toast.success("Rating updated!");
      } else {
        await addRating(payload);
        toast.success("Thanks for your review!");
      }
      setBooking((b) => ({ ...b, ratingStars: stars }));
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to submit rating.");
    } finally {
      setRatingSubmitting(false);
    }
  };

  return (
    <div className="manage-page">
      <div className="manage-inner">
        <h1 className="page-title">Manage Your Booking</h1>
        <p className="page-sub">
          Enter your booking reference number to view, cancel, or rate your
          stay.
        </p>

        {/* Search */}
        <div className="manage-search-card">
          <div className="manage-search-row">
            <input
              value={ref}
              onChange={(e) => setRef(e.target.value.toUpperCase())}
              placeholder="Enter reference number e.g. AB12CD34"
              maxLength={8}
              className="manage-input"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              className="btn btn-primary"
              onClick={handleSearch}
              disabled={loading}
            >
              <Search size={16} />
              {loading ? "Searching..." : "Find Booking"}
            </button>
          </div>
        </div>

        {/* Not found */}
        {searched && !booking && !loading && (
          <div className="empty-state">
            <Search size={48} strokeWidth={1} />
            <h3>Booking not found</h3>
            <p>Double-check your 8-character reference number.</p>
          </div>
        )}

        {/* Booking details */}
        {booking && (
          <div className="booking-detail-card">
            <div className="booking-detail-header">
              <div>
                <h2 className="booking-camp-name">{booking.campName}</h2>
                <div className="booking-location">
                  <MapPin size={13} /> {booking.campLocation}
                </div>
              </div>
              <span
                className={`status-badge status-${booking.status.toLowerCase()}`}
              >
                {booking.status}
              </span>
            </div>

            <div className="booking-detail-grid">
              <div className="detail-row">
                <span>Reference</span>
                <strong className="ref-highlight">
                  {booking.referenceNumber}
                </strong>
              </div>
              <div className="detail-row">
                <span>Check-in</span>
                <strong>{fmtDate(booking.checkIn)}</strong>
              </div>
              <div className="detail-row">
                <span>Check-out</span>
                <strong>{fmtDate(booking.checkOut)}</strong>
              </div>
              <div className="detail-row">
                <span>
                  <Moon size={13} /> Nights
                </span>
                <strong>{booking.numberOfNights}</strong>
              </div>
              <div className="detail-row">
                <span>Guest</span>
                <strong>
                  {booking.guestFirstName} {booking.guestLastName}
                </strong>
              </div>
              <div className="detail-row">
                <span>Phone</span>
                <strong>{booking.guestPhone}</strong>
              </div>
              {booking.discount > 0 && (
                <div className="detail-row">
                  <span>Discount</span>
                  <strong className="text-green">
                    -${booking.discount.toFixed(2)}
                  </strong>
                </div>
              )}
              <div className="detail-row total-detail">
                <span>Total</span>
                <strong>${booking.totalAmount.toFixed(2)}</strong>
              </div>
            </div>

            {/* Cancel */}
            {/* Cancel button — only for active future bookings */}
            {booking.status === "Active" && isFuture(booking) && (
              <div className="cancel-section">
                <p className="cancel-note">
                  ✅ This booking can be cancelled. The camp will become
                  available again for other guests.
                </p>
                <button className="btn btn-danger" onClick={handleCancel}>
                  <XCircle size={16} /> Cancel Booking
                </button>
              </div>
            )}

            {/* Show reason if cannot cancel */}
            {booking.status === "Active" && !isFuture(booking) && (
              <div className="cancel-section">
                <p className="cancel-note" style={{ color: "var(--red)" }}>
                  ❌ Cannot cancel — check-in date has already passed.
                </p>
              </div>
            )}

            {/* Already cancelled */}
            {booking.status === "Cancelled" && (
              <div className="cancel-section">
                <p className="cancel-note" style={{ color: "var(--red)" }}>
                  ❌ This booking was already cancelled.
                </p>
              </div>
            )}

            {/* Rating */}
            {booking.status === "Active" && isPast(booking) && (
              <div className="rating-section">
                <h3 className="rating-title">
                  {hasRating(booking)
                    ? "✏️ Update Your Rating"
                    : "⭐ Rate Your Stay"}
                </h3>
                <StarPicker value={stars} onChange={setStars} />
                <textarea
                  className="rating-comment"
                  placeholder="Share your experience (optional)..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleRating}
                  disabled={ratingSubmitting}
                >
                  {ratingSubmitting
                    ? "Submitting..."
                    : hasRating(booking)
                      ? "Update Rating"
                      : "Submit Rating"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
