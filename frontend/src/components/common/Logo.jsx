import { Link } from "react-router-dom";
import "../../styles/logo.css";

export default function Logo({ withSubtitle = false }) {
  return (
    <Link to="/" aria-label="마플 홈" className="mapl-logo shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2">
      <span className="mapl-logo-name">Mapl</span>
      {withSubtitle && <span className="mapl-logo-subtitle">My Planner</span>}
    </Link>
  );
}
