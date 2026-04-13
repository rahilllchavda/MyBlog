import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/useApp";
import {
  MapPin,
  Users,
  Star,
  Moon,
  AlertCircle,
  ArrowRight,
  CalendarDays,
} from "lucide-react";

/* ⭐ Star Rating Component */
function StarRating({ rating = 0, count = 0 }) {
  const rounded = Math.round(rating);
  const safeRating = Number.isFinite(rating) ? rating : 0;

  return (
    <div
      className="star-rating"
      aria-label={`Rating: ${safeRating.toFixed(1)} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          fill={i <= rounded ? "#f59e0b" : "none"}
          stroke={i <= rounded ? "#f59e0b" : "#d1d5db"}
        />
      ))}
      <span className="rating-text">
        {safeRating > 0
          ? `${safeRating.toFixed(1)} (${count || 0})`
          : "No reviews"}
      </span>
    </div>
  );
}

/* 🏕 Camp Card */
export default function CampCard({ camp, checkIn, checkOut }) {
  const navigate = useNavigate();
  const { setSelectedCamp } = useApp();
  const [imageLoaded, setImageLoaded] = useState(false);

  const basePrice = useMemo(
    () => Math.round(Number(camp.pricePerNight || 0)),
    [camp.pricePerNight],
  );

  const weekendPrice = useMemo(
    () => Math.round(Number(camp.weekendPricePerNight || 0)),
    [camp.weekendPricePerNight],
  );

  /* 📅 Nights Calculation (safe) */
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const diff = (end - start) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.round(diff) : 1;
  }, [checkIn, checkOut]);

  /* 💰 Price Calculation */
  const total = useMemo(() => {
    if (camp.totalPrice) return Math.round(camp.totalPrice);
    return Math.round(basePrice * nights);
  }, [camp.totalPrice, basePrice, nights]);

  /* ⚠️ Low stock check */
  const isLowStock = useMemo(
    () => Number(camp.capacity || 0) <= 2,
    [camp.capacity],
  );

  const weekendSurcharge = useMemo(() => {
    if (!weekendPrice || weekendPrice <= basePrice) return 0;
    return weekendPrice - basePrice;
  }, [weekendPrice, basePrice]);

  /* 💡 Tooltip text */
  const priceBreakdown = useMemo(() => {
    if (camp.totalPrice) return "Includes dynamic weekend pricing";
    return `${nights} night${nights > 1 ? "s" : ""} × $${basePrice}`;
  }, [camp.totalPrice, nights, basePrice]);

  const dateLabel = useMemo(() => {
    if (!checkIn || !checkOut) return "Flexible dates";
    return `${checkIn} → ${checkOut}`;
  }, [checkIn, checkOut]);

  /* 📦 Book handler */
  const handleBook = useCallback(() => {
    setSelectedCamp({ ...camp, checkIn, checkOut });
    navigate("/booking");
  }, [camp, checkIn, checkOut, navigate, setSelectedCamp]);

  const handleCardKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleBook();
      }
    },
    [handleBook],
  );

  /* 🖼 Image fallback */
  const handleImageError = (e) => {
    e.target.src = "https://placehold.co/400x250/1a3a2a/white?text=CampSite";
    setImageLoaded(true);
  };

  return (
    <article
      className="camp-card camp-card-premium"
      role="button"
      tabIndex={0}
      onKeyDown={handleCardKeyDown}
      aria-label={`View details and book ${camp.name}`}
    >
      <div className="camp-card-img-wrap">
        {!imageLoaded && <div className="camp-card-skeleton" />}

        <img
          src={camp.imageUrl}
          alt={camp.name || "Camp image"}
          className={`camp-card-img ${imageLoaded ? "is-loaded" : ""}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
        />

        <div className="camp-card-img-overlay" />

        <div className="camp-card-badges">
          <div className="camp-badge camp-badge-capacity">
            <Users size={12} /> Sleeps {camp.capacity}
          </div>

          {isLowStock && (
            <div className="camp-badge camp-badge-demand">
              <AlertCircle size={12} /> Limited spots
            </div>
          )}
        </div>
      </div>

      <div className="camp-card-body">
        <div className="camp-card-top">
          <h3 className="camp-card-name">{camp.name}</h3>
          <StarRating rating={camp.averageRating} count={camp.totalRatings} />
        </div>

        <div className="camp-card-location">
          <MapPin size={13} /> {camp.location}
        </div>

        <p className="camp-card-desc">
          {camp.description || "No description available."}
        </p>

        <div className="camp-card-meta">
          <span className="camp-meta-pill" title="Selected stay dates">
            <CalendarDays size={12} /> {dateLabel}
          </span>
          {weekendSurcharge > 0 && (
            <span className="camp-meta-pill camp-meta-pill-accent">
              Weekend +${weekendSurcharge}/night
            </span>
          )}
        </div>

        <div className="camp-card-footer">
          <div className="camp-price" title={priceBreakdown}>
            <span className="price-prefix">From</span>
            <span className="price-amount">${basePrice}</span>
            <span className="price-label">/night</span>

            <span className="price-total">
              <Moon size={12} /> {nights}n · ${total} total
            </span>
          </div>

          <button
            className="btn btn-primary camp-book-btn"
            onClick={handleBook}
            aria-label={`Book ${camp.name}`}
          >
            Book Now <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
