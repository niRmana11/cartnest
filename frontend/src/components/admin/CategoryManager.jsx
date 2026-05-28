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
    <div className="card">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Category Management
          </h2>
          <p className="text-sm text-gray-500">
            Create categories and choose trusted display icons.
          </p>
        </div>

        {editingCategory && (
          <button
            type="button"
            onClick={() => setEditingCategory(null)}
            className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <input
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="Category name"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-400"
        />

        <select
          value={form.icon}
          onChange={(event) =>
            setForm((current) => ({ ...current, icon: event.target.value }))
          }
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-400"
        >
          {CATEGORY_ICON_OPTIONS.filter((option) => option.value !== "grid").map(
            (option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ),
          )}
        </select>

        <button
          type="submit"
          disabled={isSaving}
          className="btn-primary inline-flex items-center justify-center gap-2"
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
      </form>

      <div className="space-y-3">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.icon);

          return (
            <div
              key={category._id}
              className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>

                <div>
                  <p className="font-semibold text-gray-900">
                    {category.name}
                  </p>
                  <p className="text-xs text-gray-500">{category.slug}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(category)}
                  disabled={isSaving}
                  className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center disabled:opacity-50"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(category)}
                  disabled={isSaving}
                  className="w-9 h-9 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-center disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {categories.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-6">
            No categories created yet.
          </p>
        )}
      </div>
    </div>
  );
}