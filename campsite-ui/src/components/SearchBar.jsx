import { useMemo, useState, useCallback } from "react";
import { useApp } from "../context/useApp";
import { Search, Calendar, Users, X, Info, Loader } from "lucide-react";

function toLocalDateStr(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function SearchBar({ onSearch, isLoading = false }) {
  const { search, setSearch } = useApp();
  const [showHint, setShowHint] = useState(false);

  const today = useMemo(() => {
    return toLocalDateStr(new Date());
  }, []);

  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toLocalDateStr(d);
  }, []);

  const nights = useMemo(() => {
    if (!search.checkIn || !search.checkOut) return 0;

    const start = new Date(search.checkIn);
    const end = new Date(search.checkOut);
    const diff = Math.ceil((end - start) / 86400000);

    return diff > 0 ? diff : 0;
  }, [search.checkIn, search.checkOut]);

  const updateSearch = useCallback(
    (key, value) => {
      setSearch((prev) => {
        const next = { ...prev, [key]: value, page: 1 };

        if (key === "checkIn") {
          const nextCheckIn = new Date(value);
          const currentCheckOut = prev.checkOut
            ? new Date(prev.checkOut)
            : null;

          if (!currentCheckOut || nextCheckIn >= currentCheckOut) {
            nextCheckIn.setDate(nextCheckIn.getDate() + 1);
            next.checkOut = nextCheckIn.toISOString().split("T")[0];
          }
        }

        if (key === "checkOut") {
          const checkInDate = prev.checkIn ? new Date(prev.checkIn) : null;
          const newCheckOut = new Date(value);

          if (checkInDate && newCheckOut <= checkInDate) {
            const fixed = new Date(checkInDate);
            fixed.setDate(fixed.getDate() + 1);
            next.checkOut = fixed.toISOString().split("T")[0];
          }
        }

        return next;
      });
    },
    [setSearch],
  );

  const handleReset = useCallback(() => {
    setSearch({
      checkIn: today,
      checkOut: tomorrow,
      capacity: "",
      page: 1,
    });
    setShowHint(false);
  }, [setSearch, today, tomorrow]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") setShowHint(false);
  }, []);

  const hasActiveFilters =
    search.capacity !== "" ||
    search.checkIn !== today ||
    search.checkOut !== tomorrow;

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
            onChange={(e) => updateSearch("checkIn", e.target.value)}
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
            onChange={(e) => updateSearch("checkOut", e.target.value)}
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
            onChange={(e) => updateSearch("capacity", e.target.value)}
          >
            <option value="">Any</option>
            <option value="1">1+ guest</option>
            <option value="2">2+ guests</option>
            <option value="4">4+ guests</option>
            <option value="6">6+ guests</option>
            <option value="8">8+ guests</option>
            <option value="10">10+ guests</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-ghost search-clear"
            onClick={handleReset}
            aria-label="Clear search filters"
          >
            <X size={16} /> Clear
          </button>
        )}

        <button
          type="button"
          className="btn btn-primary search-btn"
          onClick={() => {
            if (!isLoading) onSearch();
          }}
          disabled={isLoading}
          aria-label="Search camps"
        >
          {isLoading ? (
            <>
              <Loader size={16} className="spinner" /> Searching...
            </>
          ) : (
            <>
              <Search size={16} /> Search
            </>
          )}
        </button>

        <button
          type="button"
          className="search-hint-btn"
          onClick={() => setShowHint((v) => !v)}
          aria-label="Show help"
          aria-expanded={showHint}
        >
          <Info size={16} />
        </button>
      </div>

      {showHint && (
        <div className="search-hint" role="complementary">
          <strong>Quick tips</strong>
          <ul>
            <li>Use the Search button to load results</li>
            <li>Escape closes this help</li>
          </ul>
        </div>
      )}
    </div>
  );
}
