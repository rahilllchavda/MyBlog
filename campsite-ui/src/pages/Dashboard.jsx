import { Fragment, useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getCamps } from "../services/api";
import { useApp } from "../context/useApp";
import { useAuth } from "../hooks/useAuth";
import SearchBar from "../components/SearchBar";
import CampCard from "../components/CampCard";

import {
  Tent,
  ChevronLeft,
  ChevronRight,
  Settings,
  BookOpen,
  LogIn,
  Compass,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="camp-card skeleton-card">
      <div className="skeleton skeleton-img" />
      <div className="camp-card-body">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text short" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { search, setSearch, ratingsRefreshTick } = useApp();
  const { isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const hasLoadedDefaultResults = useRef(false);
  const previousRatingsTick = useRef(ratingsRefreshTick);

  const fetchCamps = useCallback(
    async (page = search.page) => {
      setLoading(true);
      try {
        const params = {
          checkIn: search.checkIn,
          checkOut: search.checkOut,
          page,
          pageSize: search.pageSize,
        };
        if (search.capacity) params.capacity = search.capacity;
        const res = await getCamps(params);
        setData(res.data);
      } catch {
        toast.error("Failed to load camps. Check your connection.");
      } finally {
        setLoading(false);
      }
    },
    [search],
  );

  // Button-triggered search: trigger manual fetch with page reset
  const handleSearch = useCallback(() => {
    setHasSearched(true);
    setSearch((s) => ({ ...s, page: 1 }));
    fetchCamps(1);
  }, [fetchCamps, setSearch]);

  const changePage = (p) => {
    setSearch((s) => ({ ...s, page: p }));
    fetchCamps(p);
  };

  // Default behavior: load camps once for today's check-in and tomorrow's check-out
  useEffect(() => {
    if (hasLoadedDefaultResults.current) return;
    hasLoadedDefaultResults.current = true;
    setHasSearched(true);
    setSearch((s) => ({ ...s, page: 1 }));
    fetchCamps(1);
  }, [fetchCamps, setSearch]);

  // If a rating is added/updated elsewhere, refresh currently shown camp results
  useEffect(() => {
    if (previousRatingsTick.current === ratingsRefreshTick) return;

    previousRatingsTick.current = ratingsRefreshTick;

    if (!hasSearched) return;

    fetchCamps(search.page);
  }, [ratingsRefreshTick, hasSearched, fetchCamps, search.page]);

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="dashboard">
      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <Tent size={12} /> Premium Camp Booking
          </div>
          <h1 className="hero-title">
            Find Your Perfect
            <br />
            <span className="hero-accent">Escape in Nature</span>
          </h1>
          <p className="hero-sub">
            Handpicked campsites with instant booking, flexible cancellation and
            verified reviews.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                document
                  .getElementById("dashboard-results")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <Compass size={16} /> Explore Camps
            </button>
            <Link to="/manage" className="btn btn-outline-white">
              <BookOpen size={16} /> Manage Booking
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">{data?.totalCount ?? "—"}</div>
              <div className="hero-stat-label">Available camps</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">100%</div>
              <div className="hero-stat-label">Verified listings</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">Free</div>
              <div className="hero-stat-label">Cancellation</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <SearchBar onSearch={handleSearch} isLoading={loading} />

      {/* Admin bar — shows only when logged in as admin */}
      {isAdmin && (
        <div className="admin-bar">
          <div className="admin-bar-left">
            <span className="admin-pill">ADMIN</span>
            <span>You are viewing the admin dashboard</span>
          </div>
          <div className="admin-bar-right">
            <Link to="/admin" className="btn btn-sm btn-primary">
              <Settings size={14} /> Manage Camps
            </Link>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="dashboard-body" id="dashboard-results" aria-live="polite">
        <div className="results-header">
          <div className="results-copy">
            <h2 className="results-title">
              {loading
                ? "Finding camps..."
                : `${data?.totalCount ?? 0} camp${data?.totalCount !== 1 ? "s" : ""} available`}
            </h2>
            {!loading && hasSearched && data?.totalPages > 0 && (
              <p className="results-subtitle">
                Showing page {search.page} of {data.totalPages}
              </p>
            )}
          </div>
          <div className="results-meta">
            <span className="results-badge">
              📅 {fmtDate(search.checkIn)} → {fmtDate(search.checkOut)}
            </span>
            {search.capacity && (
              <span className="results-badge">
                👥 {search.capacity}+ guests
              </span>
            )}
          </div>
        </div>

        {/* Skeleton loading */}
        {loading && (
          <div className="camp-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && hasSearched && data?.camps?.length === 0 && (
          <div className="empty-state">
            <Tent size={64} strokeWidth={1} color="var(--text-4)" />
            <h3>No camps available</h3>
            <p>
              Try different dates or a lower guest count. All our camps might be
              fully booked for these dates.
            </p>
            <button
              className="btn btn-outline"
              onClick={() => {
                setSearch((s) => ({ ...s, capacity: "", page: 1 }));
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Camp grid */}
        {!loading && hasSearched && data?.camps?.length > 0 && (
          <div className="camp-grid">
            {data.camps.map((camp) => (
              <CampCard
                key={camp.id}
                camp={camp}
                checkIn={search.checkIn}
                checkOut={search.checkOut}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {hasSearched && data?.totalPages > 1 && (
          <nav className="pagination" aria-label="Camp results pages">
            <button
              className="page-btn"
              disabled={search.page === 1}
              onClick={() => changePage(1)}
              title="First page"
            >
              «
            </button>
            <button
              className="page-btn"
              disabled={search.page === 1}
              onClick={() => changePage(search.page - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: data.totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === data.totalPages ||
                  Math.abs(p - search.page) <= 2,
              )
              .map((p, idx, arr) => (
                <Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="page-dots" aria-hidden="true">
                      …
                    </span>
                  )}
                  <button
                    className={`page-btn ${search.page === p ? "active" : ""}`}
                    onClick={() => changePage(p)}
                    aria-label={`Go to page ${p}`}
                    aria-current={search.page === p ? "page" : undefined}
                  >
                    {p}
                  </button>
                </Fragment>
              ))}
            <button
              className="page-btn"
              disabled={search.page === data.totalPages}
              onClick={() => changePage(search.page + 1)}
            >
              <ChevronRight size={16} />
            </button>
            <button
              className="page-btn"
              disabled={search.page === data.totalPages}
              onClick={() => changePage(data.totalPages)}
              title="Last page"
            >
              »
            </button>
          </nav>
        )}
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Tent size={20} strokeWidth={1.5} />
            <span>CampSite</span>
          </div>
          <p className="footer-copy">
            © 2025 CampSite. Payment collected at check-in. All bookings subject
            to availability.
          </p>
          <div className="footer-links">
            <Link to="/manage">Manage Booking</Link>
            <Link to="/login">Admin Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
