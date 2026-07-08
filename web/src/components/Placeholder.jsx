import { Link } from 'react-router-dom';
import './Placeholder.css';

// Shared "coming soon" notice for the routes this slice intentionally does
// not fully build yet (Product detail / Cart / About / Contact -- per the
// CIO task brief, only Home + Shop are in scope for this slice). Exists so
// routing/navigation never 404s while those pages are still pending.
export default function Placeholder({ title, note }) {
  return (
    <div className="container placeholder-wrap">
      <div className="placeholder-card">
        <h1>{title}</h1>
        <p>{note || 'העמוד הזה בבנייה — בקרוב.'}</p>
        <Link to="/shop" className="btn btn-primary btn-lg">
          לחנות
        </Link>
      </div>
    </div>
  );
}
