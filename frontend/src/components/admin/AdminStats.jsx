import { Boxes, Layers, PackageCheck, PackageX } from "lucide-react";

export default function AdminStats({ products, categories }) {
  const totalProducts = products.length;
  const inStockProducts = products.filter(
    (product) => product.stock > 0,
  ).length;
  const outOfStockProducts = products.filter(
    (product) => product.stock <= 0,
  ).length;

  const stats = [
    {
      label: "Products",
      value: totalProducts,
      icon: Boxes,
      accent: "bg-primary-100 text-primary-700",
    },
    {
      label: "Categories",
      value: categories.length,
      icon: Layers,
      accent: "bg-blue-100 text-blue-700",
    },
    {
      label: "In Stock",
      value: inStockProducts,
      icon: PackageCheck,
      accent: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Out of Stock",
      value: outOfStockProducts,
      icon: PackageX,
      accent: "bg-red-100 text-red-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>

              <div
                className={`w-11 h-11 rounded-lg flex items-center justify-center ${stat.accent}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
