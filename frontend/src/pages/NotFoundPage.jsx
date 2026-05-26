import { Link } from 'react-router-dom';

/**
 * NotFoundPage Component
 * 
 * Shows when user visits route that doesn't exist
 */

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-2xl text-gray-700 mb-8">Page Not Found</p>
        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
        <Link 
          to="/" 
          className="btn-primary"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}