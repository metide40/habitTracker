import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-meta mb-3">404</p>
      <h1 className="font-serif text-4xl text-foreground">Page not found</h1>
      <p className="text-sm text-muted mt-3">That page doesn't exist, or it was moved.</p>
      <Link to="/" className="inline-block mt-6 px-4 py-2 text-sm font-medium rounded bg-primary text-white hover:bg-primary-hover">
        Back to Today
      </Link>
    </div>
  );
}
