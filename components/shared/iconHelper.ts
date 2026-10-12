import {
  // Entertainment
  Film,
  Tv,
  Gamepad2,
  Music,
  Headphones,
  Ticket,
  Clapperboard,
  Sparkles,
  // Food
  Utensils,
  Coffee,
  Beer,
  Wine,
  Pizza,
  Cookie,
  Apple,
  Flame,
  // Shopping
  ShoppingCart,
  ShoppingBag,
  Shirt,
  Tag,
  Package,
  Gift,
  Watch,
  Store,
  // Life
  Home,
  Baby,
  Dog,
  Cat,
  Flower2,
  PartyPopper,
  Calendar,
  Camera,
  // Healthcare
  HeartPulse,
  Stethoscope,
  Pill,
  Activity,
  Syringe,
  Cross,
  ShieldAlert,
  Thermometer,
  // Personal
  User,
  Smile,
  Scissors,
  Dumbbell,
  Sparkle,
  Crown,
  BookOpen,
  Heart,
  // Education
  GraduationCap,
  BookMarked,
  Library,
  Pencil,
  School,
  Backpack,
  Notebook,
  Award,
  // Transportation
  Car,
  Bus,
  Bike,
  TrainFront,
  Fuel,
  Navigation,
  Gauge,
  Wrench,
  // Travel
  Plane,
  Luggage,
  Globe,
  Compass,
  MapPin,
  Hotel,
  Mountain,
  Palmtree,
  // Finance
  Banknote,
  CreditCard,
  Wallet,
  Coins,
  TrendingUp,
  PiggyBank,
  Landmark,
  Receipt,
  // Others
  Briefcase,
  Laptop,
  Smartphone,
  Zap,
  Shield,
  Star,
  Bookmark,
  MoreHorizontal,
  // Legacy compatibility
  Building2,
  type LucideIcon,
} from "lucide-react";

export interface CategoryIconItem {
  name: string;
  icon: LucideIcon;
}

export interface CategoryIconGroup {
  id: string;
  name: string;
  icons: CategoryIconItem[];
}

export const CATEGORY_ICON_GROUPS: CategoryIconGroup[] = [
  {
    id: "entertainment",
    name: "Entertainment",
    icons: [
      { name: "Film", icon: Film },
      { name: "Tv", icon: Tv },
      { name: "Gamepad2", icon: Gamepad2 },
      { name: "Music", icon: Music },
      { name: "Headphones", icon: Headphones },
      { name: "Ticket", icon: Ticket },
      { name: "Clapperboard", icon: Clapperboard },
      { name: "Sparkles", icon: Sparkles },
    ],
  },
  {
    id: "food",
    name: "Food",
    icons: [
      { name: "Utensils", icon: Utensils },
      { name: "Coffee", icon: Coffee },
      { name: "Beer", icon: Beer },
      { name: "Wine", icon: Wine },
      { name: "Pizza", icon: Pizza },
      { name: "Cookie", icon: Cookie },
      { name: "Apple", icon: Apple },
      { name: "Flame", icon: Flame },
    ],
  },
  {
    id: "shopping",
    name: "Shopping",
    icons: [
      { name: "ShoppingCart", icon: ShoppingCart },
      { name: "ShoppingBag", icon: ShoppingBag },
      { name: "Shirt", icon: Shirt },
      { name: "Tag", icon: Tag },
      { name: "Package", icon: Package },
      { name: "Gift", icon: Gift },
      { name: "Watch", icon: Watch },
      { name: "Store", icon: Store },
    ],
  },
  {
    id: "life",
    name: "Life",
    icons: [
      { name: "Home", icon: Home },
      { name: "Baby", icon: Baby },
      { name: "Dog", icon: Dog },
      { name: "Cat", icon: Cat },
      { name: "Flower2", icon: Flower2 },
      { name: "PartyPopper", icon: PartyPopper },
      { name: "Calendar", icon: Calendar },
      { name: "Camera", icon: Camera },
    ],
  },
  {
    id: "healthcare",
    name: "Healthcare",
    icons: [
      { name: "HeartPulse", icon: HeartPulse },
      { name: "Stethoscope", icon: Stethoscope },
      { name: "Pill", icon: Pill },
      { name: "Activity", icon: Activity },
      { name: "Syringe", icon: Syringe },
      { name: "Cross", icon: Cross },
      { name: "ShieldAlert", icon: ShieldAlert },
      { name: "Thermometer", icon: Thermometer },
    ],
  },
  {
    id: "personal",
    name: "Personal",
    icons: [
      { name: "User", icon: User },
      { name: "Smile", icon: Smile },
      { name: "Scissors", icon: Scissors },
      { name: "Dumbbell", icon: Dumbbell },
      { name: "Sparkle", icon: Sparkle },
      { name: "Crown", icon: Crown },
      { name: "BookOpen", icon: BookOpen },
      { name: "Heart", icon: Heart },
    ],
  },
  {
    id: "education",
    name: "Education",
    icons: [
      { name: "GraduationCap", icon: GraduationCap },
      { name: "BookMarked", icon: BookMarked },
      { name: "Library", icon: Library },
      { name: "Pencil", icon: Pencil },
      { name: "School", icon: School },
      { name: "Backpack", icon: Backpack },
      { name: "Notebook", icon: Notebook },
      { name: "Award", icon: Award },
    ],
  },
  {
    id: "transportation",
    name: "Transportation",
    icons: [
      { name: "Car", icon: Car },
      { name: "Bus", icon: Bus },
      { name: "Bike", icon: Bike },
      { name: "TrainFront", icon: TrainFront },
      { name: "Fuel", icon: Fuel },
      { name: "Navigation", icon: Navigation },
      { name: "Gauge", icon: Gauge },
      { name: "Wrench", icon: Wrench },
    ],
  },
  {
    id: "travel",
    name: "Travel",
    icons: [
      { name: "Plane", icon: Plane },
      { name: "Luggage", icon: Luggage },
      { name: "Globe", icon: Globe },
      { name: "Compass", icon: Compass },
      { name: "MapPin", icon: MapPin },
      { name: "Hotel", icon: Hotel },
      { name: "Mountain", icon: Mountain },
      { name: "Palmtree", icon: Palmtree },
    ],
  },
  {
    id: "finance",
    name: "Finance",
    icons: [
      { name: "Banknote", icon: Banknote },
      { name: "CreditCard", icon: CreditCard },
      { name: "Wallet", icon: Wallet },
      { name: "Coins", icon: Coins },
      { name: "TrendingUp", icon: TrendingUp },
      { name: "PiggyBank", icon: PiggyBank },
      { name: "Landmark", icon: Landmark },
      { name: "Receipt", icon: Receipt },
    ],
  },
  {
    id: "others",
    name: "Others",
    icons: [
      { name: "Briefcase", icon: Briefcase },
      { name: "Laptop", icon: Laptop },
      { name: "Smartphone", icon: Smartphone },
      { name: "Zap", icon: Zap },
      { name: "Shield", icon: Shield },
      { name: "Star", icon: Star },
      { name: "Bookmark", icon: Bookmark },
      { name: "MoreHorizontal", icon: MoreHorizontal },
    ],
  },
];

export const AVAILABLE_ICONS: Record<string, LucideIcon> = {
  Building2,
  ...CATEGORY_ICON_GROUPS.reduce<Record<string, LucideIcon>>((acc, group) => {
    group.icons.forEach(({ name, icon }) => {
      acc[name] = icon;
    });
    return acc;
  }, {}),
};

export const COLOR_PALETTE = [
  "#62aef0", // Notion Blue
  "#1aae39", // Notion Green
  "#2a9d99", // Notion Teal
  "#d6b6f6", // Notion Purple
  "#ff64c8", // Notion Pink
  "#e03e3e", // Notion Coral
  "#dd5b00", // Notion Amber / Rust
  "#d9730d", // Notion Orange
  "#cb903f", // Notion Yellow
  "#9065b0", // Notion Violet
  "#337ea9", // Notion Steel
  "#0f7b6c", // Notion Forest
  "#523410", // Notion Brown
  "#9b9a97", // Notion Gray
];

export function getCategoryIcon(iconName: string): LucideIcon {
  return AVAILABLE_ICONS[iconName] || MoreHorizontal;
}
