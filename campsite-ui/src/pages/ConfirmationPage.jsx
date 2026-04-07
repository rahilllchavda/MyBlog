import { Navigate, useNavigate } from "react-router-dom";
import { useApp } from "../context/useApp";
import { CheckCircle, MapPin, Moon, Copy } from "lucide-react";
import toast from "react-hot-toast";

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { confirmedBooking } = useApp();

  if (!confirmedBooking) {
    return <Navigate to="/" replace />;
  }

  const b = confirmedBooking;
  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const copyRef = () => {
    navigator.clipboard.writeText(b.referenceNumber);
    toast.success("Reference number copied!");
  };

  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        {/* Success icon */}
        <div className="confirm-icon">
          <CheckCircle size={64} strokeWidth={1.5} color="#16a34a" />
        </div>
        <h1 className="confirm-title">Booking Confirmed!</h1>
        <p className="confirm-sub">
          Your campsite has been reserved. Save your reference number below.
        </p>

        {/* Reference number */}
        <div className="ref-box">
          <span className="ref-label">Booking Reference</span>
          <div className="ref-number-row">
            <span className="ref-number">{b.referenceNumber}</span>
            <button className="copy-btn" onClick={copyRef} title="Copy">
              <Copy size={16} />
            </button>
          </div>
        </div>

        {/* Details grid */}
        <div className="confirm-details">
          <div className="detail-row">
            <span>Camp</span>
            <strong>{b.campName}</strong>
          </div>
          <div className="detail-row">
            <span>
              <MapPin size={13} /> Location
            </span>
            <strong>{b.campLocation}</strong>
          </div>
          <div className="detail-row">
            <span>Check-in</span>
            <strong>{fmtDate(b.checkIn)}</strong>
          </div>
          <div className="detail-row">
            <span>Check-out</span>
            <strong>{fmtDate(b.checkOut)}</strong>
          </div>
          <div className="detail-row">
            <span>
              <Moon size={13} /> Duration
            </span>
            <strong>
              {b.numberOfNights} night{b.numberOfNights > 1 ? "s" : ""}
            </strong>
          </div>
          <div className="detail-row">
            <span>Guest</span>
            <strong>
              {b.guestFirstName} {b.guestLastName}
            </strong>
          </div>
          <div className="detail-row">
            <span>Phone</span>
            <strong>{b.guestPhone}</strong>
          </div>
          <div className="detail-row">
            <span>Address</span>
            <strong>
              {b.billingAddress}, {b.city}, {b.zipCode}
            </strong>
          </div>
          {b.discount > 0 && (
            <div className="detail-row">
              <span>Discount</span>
              <strong className="text-green">-${b.discount.toFixed(2)}</strong>
            </div>
          )}
          <div className="detail-row total-detail">
            <span>Total Due at Check-in</span>
            <strong>${b.totalAmount.toFixed(2)}</strong>
          </div>
        </div>

        {/* Actions */}
        <div className="confirm-actions">
          <button
            className="btn btn-outline"
            onClick={() => navigate("/manage")}
          >
            Manage Booking
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
