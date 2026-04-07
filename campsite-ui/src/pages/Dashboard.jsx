import { useState, useEffect, useCallback } from "react";
import { getCamps } from "../services/api";
import { useApp } from "../context/useApp";
import SearchBar from "../components/SearchBar";
import CampCard from "../components/CampCard";
import { Tent, ChevronLeft, ChevronRight, Loader } from "lucide-react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { search, setSearch } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCamps = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        checkIn: search.checkIn,
        checkOut: search.checkOut,
        page: search.page,
        pageSize: search.pageSize,
      };
      if (search.capacity) params.capacity = search.capacity;
      const res = await getCamps(params);
      setData(res.data);
    } catch {
      toast.error("Failed to load camps. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCamps();
  }, [fetchCamps]);

  const handleSearch = () => {
    setSearch((s) => ({ ...s, page: 1 }));
  };

  const changePage = (p) => setSearch((s) => ({ ...s, page: p }));

  return (
    <div className="dashboard">
      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Find Your Perfect <span className="hero-accent">Campsite</span>
          </h1>
          <p className="hero-sub">
            Discover handpicked campsites — book, explore, and rate your stay.
          </p>
        </div>
      </div>

      <SearchBar onSearch={handleSearch} />

      <div className="dashboard-body">
        {/* Results header */}
        <div className="results-header">
          <h2 className="results-title">
            {loading
              ? "Searching..."
              : `${data?.totalCount ?? 0} camps available`}
          </h2>
          <span className="results-dates">
            {new Date(search.checkIn).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            →{" "}
            {new Date(search.checkOut).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="loading-state">
            <Loader size={36} className="spinner" />
            <p>Finding the best camps for you...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && data?.camps?.length === 0 && (
          <div className="empty-state">
            <Tent size={56} strokeWidth={1} />
            <h3>No camps available</h3>
            <p>Try different dates or adjust your guest count.</p>
          </div>
        )}

        {/* Grid */}
        {!loading && data?.camps?.length > 0 && (
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
        {data?.totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={search.page === 1}
              onClick={() => changePage(search.page - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  className={`page-btn ${search.page === p ? "active" : ""}`}
                  onClick={() => changePage(p)}
                >
                  {p}
                </button>
              ),
            )}
            <button
              className="page-btn"
              disabled={search.page === data.totalPages}
              onClick={() => changePage(search.page + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
