import { Edit, Loader, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CATEGORY_ICON_OPTIONS,
  getCategoryIcon,
} from "../../utils/categoryIcons";

const initialForm = {
  name: "",
  icon: "package",
};

export default function CategoryManager({
  categories,
  onCreate,
  onUpdate,
  onDelete,
  isSaving,
}) {
  const [form, setForm] = useState(initialForm);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    if (editingCategory) {
      setForm({
        name: editingCategory.name,
        icon: editingCategory.icon || "package",
      });
    } else {
      setForm(initialForm);
    }
  }, [editingCategory]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (editingCategory) {
      onUpdate(editingCategory._id, form);
    } else {
      onCreate(form);
    }

    setEditingCategory(null);
  };

  return (
    <section className="card">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Category Management
          </h2>
          <p className="text-gray-600 mt-1">
            Create shop categories and choose trusted display icons.
          </p>
        </div>

        {editingCategory && (
          <button
            type="button"
            onClick={() => setEditingCategory(null)}
            className="btn-secondary btn-sm inline-flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        {/* Row 1 */}
        <div className="flex justify-center">
          {/* Choose Icon */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 w-full max-w-2xl">
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Choose Icon
            </label>

            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-2">
              {CATEGORY_ICON_OPTIONS.filter(
                (option) => option.value !== "grid",
              ).map((option) => {
                const Icon = option.icon;
                const isSelected = form.icon === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        icon: option.value,
                      }))
                    }
                    title={option.label}
                    className={`h-12 w-12 rounded-lg border flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-primary-500 text-white border-primary-500 shadow-md scale-105"
                        : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:text-primary-600"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4 items-end">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category Name
            </label>

            <input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Example: Snacks"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-400"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary h-12.5 px-6 inline-flex items-center justify-center gap-2 rounded-xl"
          >
            {isSaving ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : editingCategory ? (
              <Save className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}

            {editingCategory ? "Update Category" : "Create Category"}
          </button>
        </div>
      </form>

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Existing Categories
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icon);

            return (
              <div
                key={category._id}
                className="p-4 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {category.name}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(category)}
                    disabled={isSaving}
                    className="w-9 h-9 rounded-lg hover:bg-white flex items-center justify-center disabled:opacity-50"
                    title="Edit category"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(category)}
                    disabled={isSaving}
                    className="w-9 h-9 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-center disabled:opacity-50"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {categories.length === 0 && (
            <p className="text-sm text-gray-500 py-6">
              No categories created yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
