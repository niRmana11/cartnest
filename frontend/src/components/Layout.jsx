import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * Layout Component
 *
 * Wraps all pages with:
 * - Navbar (top)
 * - Page content (children)
 * - Footer (bottom)
 *
 * This way, every page automatically has consistent header/footer
 * without repeating code on each page
 *
 */

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Sticky navbar at top */}
      <Navbar />

      {/* Main content - grows to fill space */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer always at bottom */}
      <Footer />
    </div>
  );
}
