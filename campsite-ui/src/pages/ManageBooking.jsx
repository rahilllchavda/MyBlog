import { useState } from "react";
import {
  getBooking,
  cancelBooking,
  addRating,
  updateRating,
} from "../services/api";
import { useApp } from "../context/useApp";
import {
  Search,
  Star,
  XCircle,
  MapPin,
  Moon,
  Mail,
  Ticket,
  CheckCircle2,
  Clock3,
} from "lucide-react";
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
  const { triggerRatingsRefresh } = useApp();
  const [query, setQuery] = useState("");
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
    return checkOut <= today;
  };
  const hasRating = (b) => b.ratingStars != null;
  const isEmailQuery = /\S+@\S+\.\S+/.test(query.trim());

  const handleSearch = async () => {
    const value = query.trim();

    if (!value) {
      toast.error("Enter a booking reference number or guest email.");
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const res = await getBooking(value);
      setBooking(res.data);
      setStars(res.data.ratingStars ?? 0);
      setComment("");
    } catch {
      setBooking(null);
      toast.error(
        isEmailQuery
          ? "No completed or active bookings found for this email."
          : "Booking not found. Check your reference number.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;
    try {
      const ownerEmail = booking?.guestEmail?.trim().toLowerCase();
      await cancelBooking(booking.referenceNumber, ownerEmail);
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
      const ownerEmail = booking?.guestEmail?.trim().toLowerCase();
      const payload = {
        referenceNumber: booking.referenceNumber,
        guestEmail: ownerEmail,
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
      triggerRatingsRefresh();
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
          Search using either your booking reference number or guest email to
          view, cancel, or rate your stay.
        </p>

        {/* Search */}
        <div className="manage-search-card">
          <div className="manage-search-header">
            <div>
              <h3>Find your reservation</h3>
              <p>
                Use <strong>AB12CD34</strong> style reference or your guest
                email address.
              </p>
            </div>
            <div className="manage-search-mode">
              {isEmailQuery ? (
                <>
                  <Mail size={14} /> Email lookup
                </>
              ) : (
                <>
                  <Ticket size={14} /> Reference lookup
                </>
              )}
            </div>
          </div>
          <div className="manage-search-row">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter booking reference or guest email"
              className="manage-input"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />

            <button
              className="btn btn-primary"
              onClick={handleSearch}
              disabled={loading}
            >
              <Search size={16} />
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
          <div className="manage-search-helper">
            <span>
              <Ticket size={13} /> Search one booking directly by reference
              number.
            </span>
            <span>
              <Mail size={13} /> Search your latest relevant booking by email.
            </span>
          </div>
        </div>

        {/* Not found */}
        {searched && !booking && !loading && (
          <div className="empty-state">
            <Search size={48} strokeWidth={1} />
            <h3>Booking not found</h3>
            <p>
              Double-check the booking reference number or email address you
              entered.
            </p>
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
                <p className="cancel-note">
                  <Clock3 size={14} /> Rating becomes available once your stay
                  is completed.
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
                <div className="rating-note">
                  <CheckCircle2 size={14} />
                  {hasRating(booking)
                    ? "You can update your previous rating anytime."
                    : "Your stay is complete — you can now rate this camp out of 5 stars."}
                </div>
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
