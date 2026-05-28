import {
  Apple,
  CakeSlice,
  Candy,
  Carrot,
  ChefHat,
  Coffee,
  Cookie,
  CupSoda,
  Drumstick,
  Fish,
  Flower2,
  Grid3X3,
  IceCreamBowl,
  Leaf,
  Milk,
  Package,
  Pizza,
  Sandwich,
  ShoppingBag,
  Soup,
  Wheat,
  Broccoli,
} from "lucide-react";

export const CATEGORY_ICON_OPTIONS = [
  { label: "General", value: "package", icon: Package },
  { label: "All", value: "grid", icon: Grid3X3 },
  { label: "Vegetables", value: "broccoli", icon: Broccoli },
  { label: "Leafy Greens", value: "leaf", icon: Leaf },
  { label: "Fruits", value: "apple", icon: Apple },
  { label: "Cakes", value: "cake", icon: CakeSlice },
  { label: "Biscuits", value: "cookie", icon: Cookie },
  { label: "Candy", value: "candy", icon: Candy },
  { label: "Ice Cream", value: "ice-cream", icon: IceCreamBowl },
  { label: "Drinks", value: "drink", icon: CupSoda },
  { label: "Coffee", value: "coffee", icon: Coffee },
  { label: "Bakery", value: "wheat", icon: Wheat },
  { label: "Meals", value: "chef", icon: ChefHat },
  { label: "Sandwich", value: "sandwich", icon: Sandwich },
  { label: "Pizza", value: "pizza", icon: Pizza },
  { label: "Soup", value: "soup", icon: Soup },
  { label: "Meat", value: "meat", icon: Drumstick },
  { label: "Fish", value: "fish", icon: Fish },
  { label: "Dairy", value: "milk", icon: Milk },
  { label: "Fresh", value: "fresh", icon: Flower2 },
  { label: "Shopping", value: "shopping", icon: ShoppingBag },
];

export const categoryIconMap = CATEGORY_ICON_OPTIONS.reduce(
  (icons, option) => ({
    ...icons,
    [option.value]: option.icon,
  }),
  {},
);

export const getCategoryIcon = (iconKey) => {
  return categoryIconMap[iconKey] || Package;
};
