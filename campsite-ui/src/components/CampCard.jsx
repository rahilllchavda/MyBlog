import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/useApp";
import { MapPin, Users, Star, Moon, AlertCircle } from "lucide-react";

function StarRating({ rating, count }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          fill={i <= Math.round(rating) ? "#f59e0b" : "none"}
          stroke={i <= Math.round(rating) ? "#f59e0b" : "#d1d5db"}
        />
      ))}
      <span className="rating-text">
        {rating > 0 ? `${rating} (${count})` : "No reviews"}
      </span>
    </div>
  );
}

export default function CampCard({ camp, checkIn, checkOut }) {
  const navigate = useNavigate();
  const { setSelectedCamp } = useApp();
  const [imageLoaded, setImageLoaded] = useState(false);

  const nights =
    checkIn && checkOut
      ? Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000)
      : 1;

  // Prefer server-calculated dynamic total (includes weekend pricing);
  // fall back to simple multiplication when not available.
  const total = camp.totalPrice
    ? camp.totalPrice.toFixed(0)
    : (camp.pricePerNight * nights).toFixed(0);

  // Check if capacity is low (< 2 guests = low inventory)
  const isLowStock = camp.capacity < 2;

  // Generate price breakdown for tooltip
  const priceBreakdown = camp.totalPrice
    ? `Total includes dynamic weekend pricing`
    : `${nights} night${nights > 1 ? "s" : ""} × $${camp.pricePerNight}`;

  const handleBook = () => {
    setSelectedCamp({ ...camp, checkIn, checkOut });
    navigate("/booking");
  };

  return (
    <div className="camp-card">
      <div className="camp-card-img-wrap">
        {/* Image skeleton loader */}
        {!imageLoaded && <div className="camp-card-skeleton" />}
        <img
          src={camp.imageUrl}
          alt={camp.name}
          className="camp-card-img"
          style={{ opacity: imageLoaded ? 1 : 0 }}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = `https://placehold.co/400x250/1a3a2a/white?text=CampSite`;
            setImageLoaded(true);
          }}
        />
        <div className="camp-card-badge">
          <Users size={12} /> {camp.capacity}
        </div>
        {isLowStock && (
          <div className="camp-card-badge camp-card-badge-alert">
            <AlertCircle size={12} /> Low Stock
          </div>
        )}
      </div>
      <div className="camp-card-body">
        <div className="camp-card-top">
          <h3 className="camp-card-name">{camp.name}</h3>
          <StarRating rating={camp.averageRating} count={camp.totalRatings} />
        </div>
        <div className="camp-card-location">
          <MapPin size={13} /> {camp.location}
        </div>
        <p className="camp-card-desc">{camp.description}</p>
        {camp.weekendPricePerNight && (
          <div className="weekend-badge">
            🏷 Weekend rate: ${camp.weekendPricePerNight}/night
          </div>
        )}
        <div className="camp-card-footer">
          <div className="camp-price" title={priceBreakdown}>
            <span className="price-amount">${camp.pricePerNight}</span>
            <span className="price-label">/night</span>
            {nights > 1 && (
              <span className="price-total">
                <Moon size={12} /> {nights}n · ${total} total
              </span>
            )}
          </div>
          <button className="btn btn-primary" onClick={handleBook}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
