import { useApp } from "../context/useApp";
import { Search, Calendar, Users, X, Info } from "lucide-react";
import { useState } from "react";

export default function SearchBar({ onSearch, isLoading = false }) {
  const { search, setSearch } = useApp();
  const [showHint, setShowHint] = useState(false);

  const todayDate = new Date();
  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const today = todayDate.toISOString().split("T")[0];
  const tomorrow = tomorrowDate.toISOString().split("T")[0];

  // Calculate number of nights
  const nights =
    search.checkIn && search.checkOut
      ? Math.ceil(
          (new Date(search.checkOut) - new Date(search.checkIn)) / 86400000,
        )
      : 0;

  const handle = (key, value) => {
    setSearch((prev) => {
      const updated = { ...prev, [key]: value, page: 1 };
      if (key === "checkIn" && value >= prev.checkOut) {
        const next = new Date(value);
        next.setDate(next.getDate() + 1);
        updated.checkOut = next.toISOString().split("T")[0];
      }
      return updated;
    });
  };

  // Reset all filters to defaults
  const handleReset = () => {
    setSearch({
      checkIn: today,
      checkOut: tomorrow,
      capacity: "",
      page: 1,
    });
  };

  // Handle Enter key to trigger search
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isLoading) {
      onSearch();
    }
  };

  // Check if any filters are active
  const hasActiveFilters =
    search.capacity !== "" || nights > 1 || search.checkIn !== today;

  return (
    <div className="search-bar-wrapper">
      <div className="search-bar">
        <div className="search-field">
          <label>
            <Calendar size={14} /> Check-in
          </label>
          <input
            type="date"
            value={search.checkIn}
            min={today}
            onChange={(e) => handle("checkIn", e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Check-in date"
            className={search.checkIn !== today ? "has-value" : ""}
          />
        </div>

        <div className="search-field">
          <label>
            <Calendar size={14} /> Check-out
            {nights > 0 && <span className="nights-badge">{nights}n</span>}
          </label>
          <input
            type="date"
            value={search.checkOut}
            min={search.checkIn || tomorrow}
            onChange={(e) => handle("checkOut", e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Check-out date"
            className={search.checkOut !== tomorrow ? "has-value" : ""}
          />
        </div>

        <div className="search-field">
          <label>
            <Users size={14} /> Guests
          </label>
          <select
            value={search.capacity}
            onChange={(e) => handle("capacity", e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Number of guests"
            className={search.capacity !== "" ? "has-value" : ""}
          >
            <option value="">Any</option>
            {[1, 2, 4, 6, 8, 10].map((n) => (
              <option key={n} value={n}>
                {n}+ guests
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-primary search-btn"
          onClick={onSearch}
          disabled={isLoading}
          title="Press Enter or click to search (Ctrl+K)"
          aria-label="Search camps"
        >
          {isLoading ? (
            <>
              <div className="spinner-sm" />
              Searching...
            </>
          ) : (
            <>
              <Search size={18} /> Search
            </>
          )}
        </button>

        {hasActiveFilters && (
          <button
            className="btn btn-ghost search-clear"
            onClick={handleReset}
            title="Reset all filters"
            aria-label="Clear search filters"
          >
            <X size={16} /> Clear
          </button>
        )}

        <button
          className="search-hint-btn"
          onClick={() => setShowHint(!showHint)}
          title="Show keyboard shortcuts"
          aria-label="Show help"
        >
          <Info size={16} />
        </button>
      </div>

      {showHint && (
        <div className="search-hint" role="complementary">
          <strong>💡 Keyboard shortcuts:</strong>
          <ul>
            <li>
              Press <kbd>Enter</kbd> to search
            </li>
            <li>Use date inputs to set your trip</li>
          </ul>
        </div>
      )}
    </div>
  );
}
