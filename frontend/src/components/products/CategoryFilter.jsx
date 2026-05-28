import { Grid3X3 } from "lucide-react";
import { getCategoryIcon } from "../../utils/categoryIcons";

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      <button
        type="button"
        onClick={() => onCategoryChange("all")}
        className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all ${
          selectedCategory === "all"
            ? "bg-primary-500 text-white border-primary-500 shadow-md"
            : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:text-primary-600"
        }`}
      >
        <Grid3X3 className="w-4 h-4" />
        All
      </button>

      {categories.map((category) => {
        const Icon = getCategoryIcon(category.icon);
        const isActive = selectedCategory === category.slug;

        return (
          <button
            key={category._id}
            type="button"
            onClick={() => onCategoryChange(category.slug)}
            className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all ${
              isActive
                ? "bg-primary-500 text-white border-primary-500 shadow-md"
                : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:text-primary-600"
            }`}
          >
            <Icon className="w-4 h-4" />
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
