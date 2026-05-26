import { useAuthStore } from "../store/authStore";

/**
 * AdminPage Component
 *
 * Placeholder - will be implemented in Day 6
 * Only accessible if user.role === 'admin'
 */

export default function AdminPage() {
  const { user } = useAuthStore();

  // Extra safety check (ProtectedRoute checks auth, this checks admin role)
  if (user?.role !== "admin") {
    return (
      <div className="py-12 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600">You do not have admin permissions.</p>
      </div>
    );
  }

  return (
    <div className="py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Admin Dashboard 🔧
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Manage products and categories
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Products Management</h2>
          <p className="text-gray-600 mb-4">Coming soon...</p>
          <button className="btn-primary">Manage Products</button>
        </div>
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Categories Management</h2>
          <p className="text-gray-600 mb-4">Coming soon...</p>
          <button className="btn-primary">Manage Categories</button>
        </div>
      </div>
    </div>
  );
}
