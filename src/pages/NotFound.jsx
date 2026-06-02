import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="card p-10 text-center">
      <p className="text-6xl font-black text-slate-200">404</p>
      <h1 className="mt-4 text-2xl font-black text-slate-950">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">The admin page you are looking for does not exist.</p>
      <Link to="/" className="btn-primary mt-6">Go to dashboard</Link>
    </div>
  );
}
