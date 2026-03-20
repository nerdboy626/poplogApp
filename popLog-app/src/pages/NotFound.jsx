import { Link } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
  return (
    <main className="notfound-page">
      <section className="notfound-card">
        <h1 className="notfound-card__code">404</h1>
        <h2 className="notfound-card__title">Page Not Found</h2>
        <p className="notfound-card__text">
          The page you're looking for doesn’t exist or may have been moved.
        </p>

        <div className="notfound-card__footer">
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </section>
    </main>
  );
};

export default NotFound;
