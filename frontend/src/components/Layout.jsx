import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * Layout Component
 *
 * Wraps all pages with:
 * - Navbar (top)
 * - Page content via <Outlet /> (React Router renders child routes here)
 * - Footer (bottom)
 *
 * Used with React Router nested routes
 */

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Sticky navbar at top */}
      <Navbar />

      {/* Main content - grows to fill space */}
      {/* Outlet renders the child route component */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* Footer always at bottom */}
      <Footer />
    </div>
  );
}
