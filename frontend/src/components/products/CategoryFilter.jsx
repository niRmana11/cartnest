import { CakeSlice, Cookie, Grid3X3, Broccoli, Apple } from "lucide-react";

const categories = [
  { label: "All", slug: "all", icon: Grid3X3 },
  { label: "Vegetables", slug: "vegetables", icon: Broccoli },
  { label: "Fruits", slug: "fruits", icon: Apple },
  { label: "Cakes", slug: "cakes", icon: CakeSlice },
  { label: "Biscuits", slug: "biscuits", icon: Cookie },
];

export default function CategoryFilter({ selectedCategory, onCategoryChange }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = selectedCategory === category.slug;

        return (
          <button
            key={category.slug}
            type="button"
            onClick={() => onCategoryChange(category.slug)}
            className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all ${
              isActive
                ? "bg-primary-500 text-white border-primary-500 shadow-md"
                : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:text-primary-600"
            }`}
          >
            <Icon className="w-4 h-4" />
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
