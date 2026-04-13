import { Link } from "react-router-dom";
import { Tent } from "lucide-react";

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div>
        <div className="not-found-code">404</div>
        <h2
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "1.8rem",
            marginBottom: "0.75rem",
          }}
        >
          Page not found
        </h2>
        <p
          style={{
            color: "var(--text-3)",
            marginBottom: "2rem",
            fontSize: "15px",
          }}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary btn-lg">
          <Tent size={18} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
