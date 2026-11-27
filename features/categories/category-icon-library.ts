import {
  resolveCategoryIconName,
  type CategoryIconName,
} from "./category-icon-components";
import {
  categoryPalettes,
  getFallbackPalette,
  type CategoryPaletteName,
} from "./category-colors";

type IconEntry = readonly [
  name: CategoryIconName,
  label: string,
  keywords?: readonly string[],
  palette?: CategoryPaletteName,
];

interface CategoryIconDefinition {
  name: CategoryIconName;
  label: string;
  group: string;
  keywords: readonly string[];
  defaultPalette: CategoryPaletteName;
}

function iconGroup(
  label: string,
  palette: CategoryPaletteName,
  keywords: readonly string[],
  entries: readonly IconEntry[],
) {
  return {
    label,
    icons: entries.map(([name, iconLabel, terms = [], override]): CategoryIconDefinition => ({
      name,
      label: iconLabel,
      group: label,
      keywords: [...keywords, ...terms],
      defaultPalette: override ?? palette,
    })),
  };
}

export const categoryIconGroups = [
  iconGroup(
    "Development and Programming",
    "blue",
    ["development", "programming", "software", "coding", "web development"],
    [
      ["Code2", "Code"],
      ["CodeXml", "Code XML"],
      ["Terminal", "Terminal", ["shell", "command line"]],
      ["Braces", "Braces"],
      ["GitBranch", "Git Branch", ["version control"]],
      ["Bug", "Bug", ["debugging"]],
      ["Webhook", "Webhook", ["API"]],
      ["FileCode", "File Code"],
    ],
  ),
  iconGroup(
    "Technology and Computing",
    "teal",
    ["technology", "computing", "programming", "hardware"],
    [
      ["Laptop", "Laptop"],
      ["Monitor", "Monitor"],
      ["Globe", "Globe", ["internet", "web"]],
      ["Server", "Server"],
      ["Cloud", "Cloud", ["hosting", "cloud computing"]],
      ["Cpu", "CPU", ["processor"]],
      ["Smartphone", "Smartphone", ["mobile", "app"], "cyan"],
      ["Layers", "Layers"],
      ["CircuitBoard", "Circuit Board"],
      ["HardDrive", "Hard Drive"],
    ],
  ),
  iconGroup(
    "Artificial Intelligence",
    "emerald",
    ["AI", "machine learning", "automation"],
    [
      ["Brain", "Brain"],
      ["Bot", "Bot", ["robot"]],
      ["Sparkles", "Sparkles", ["generative AI"]],
      ["BrainCircuit", "Brain Circuit", ["neural network"]],
      ["Workflow", "Workflow"],
      ["WandSparkles", "Wand Sparkles"],
    ],
  ),
  iconGroup(
    "Data Science and Analytics",
    "cyan",
    ["data", "analytics", "statistics"],
    [
      ["Database", "Database", ["programming", "SQL"]],
      ["ChartNoAxesColumn", "Column Chart", ["marketing", "bar chart"]],
      ["ChartPie", "Pie Chart"],
      ["TrendingUp", "Trending Up", ["marketing", "growth"]],
      ["ChartLine", "Chart Line"],
      ["ChartBar", "Chart Bar"],
      ["ChartScatter", "Chart Scatter"],
    ],
  ),
  iconGroup(
    "Business and Management",
    "indigo",
    ["business", "management", "leadership"],
    [
      ["BriefcaseBusiness", "Business Briefcase"],
      ["Building2", "Office Building"],
      ["Users", "Users", ["team"]],
      ["Presentation", "Presentation"],
      ["Handshake", "Handshake"],
      ["Briefcase", "Briefcase"],
      ["Store", "Store", ["retail"]],
    ],
  ),
  iconGroup(
    "Digital Marketing",
    "orange",
    ["marketing", "advertising", "promotion", "social media"],
    [
      ["Megaphone", "Megaphone"],
      ["Target", "Target", ["campaign"]],
      ["Search", "Search", ["SEO"]],
      ["ShoppingCart", "Shopping Cart", ["ecommerce"]],
      ["MousePointerClick", "Mouse Pointer Click", ["conversion"]],
      ["Mail", "Mail", ["email"]],
      ["BadgePercent", "Badge Percent", ["discount"]],
    ],
  ),
  iconGroup(
    "Education and Learning",
    "blue",
    ["education", "learning", "teaching", "study"],
    [
      ["GraduationCap", "Graduation Cap"],
      ["BookOpen", "Book Open"],
      ["Library", "Library"],
      ["Pencil", "Pencil"],
      ["NotebookPen", "Notebook Pen"],
      ["School", "School"],
      ["ClipboardList", "Clipboard List"],
    ],
  ),
  iconGroup(
    "Design and Creativity",
    "purple",
    ["design", "creative", "art", "UI", "UX"],
    [
      ["PenTool", "Pen Tool"],
      ["Palette", "Palette"],
      ["PenLine", "Pen Line", ["figma", "wireframes"]],
      ["Ruler", "Ruler"],
      ["Paintbrush", "Paintbrush"],
      ["Shapes", "Shapes"],
      ["LayoutTemplate", "Layout Template"],
      ["SwatchBook", "Swatch Book"],
    ],
  ),
  iconGroup(
    "Photography and Video",
    "pink",
    ["photography", "video", "media", "production"],
    [
      ["Camera", "Camera"],
      ["Video", "Video"],
      ["Film", "Film"],
      ["Music", "Music"],
      ["Mic", "Microphone", ["Microphone"]],
      ["Headphones", "Headphones"],
      ["Image", "Image"],
      ["Aperture", "Aperture"],
      ["Clapperboard", "Clapperboard"],
    ],
  ),
  iconGroup(
    "Finance and Accounting",
    "green",
    ["finance", "accounting", "money"],
    [
      ["Wallet", "Wallet"],
      ["Calculator", "Calculator"],
      ["Banknote", "Banknote"],
      ["Coins", "Coins"],
      ["CreditCard", "Credit Card"],
      ["Receipt", "Receipt"],
      ["PiggyBank", "Piggy Bank"],
    ],
  ),
  iconGroup(
    "Communication",
    "cyan",
    ["communication", "language", "messaging"],
    [
      ["MessageCircle", "Message Circle"],
      ["Languages", "Languages", ["translation"]],
      ["MessagesSquare", "Messages Square"],
      ["Phone", "Phone"],
    ],
  ),
  iconGroup(
    "Productivity",
    "amber",
    ["productivity", "personal development", "planning"],
    [
      ["CalendarDays", "Calendar Days"],
      ["Clock3", "Clock", ["Clock"]],
      ["ListChecks", "List Checks"],
      ["Timer", "Timer"],
      ["Focus", "Focus"],
      ["Lightbulb", "Lightbulb", ["idea"]],
    ],
  ),
  iconGroup(
    "Security and Networking",
    "red",
    ["security", "cyber security", "networking"],
    [
      ["Network", "Network"],
      ["ShieldCheck", "Shield Check"],
      ["Lock", "Lock"],
      ["KeyRound", "Key Round"],
      ["Fingerprint", "Fingerprint"],
      ["Shield", "Shield"],
      ["ScanLine", "Scan Line"],
      ["Router", "Router"],
      ["Wifi", "Wi-Fi", ["Wi-Fi"]],
    ],
  ),
  iconGroup(
    "Health and Fitness",
    "green",
    ["health", "fitness", "exercise", "wellness"],
    [
      ["HeartPulse", "Heart Pulse"],
      ["Dumbbell", "Dumbbell"],
      ["Stethoscope", "Stethoscope"],
      ["Leaf", "Leaf"],
      ["Bike", "Bike"],
      ["Footprints", "Footprints"],
    ],
  ),
  iconGroup(
    "General and Other",
    "slate",
    ["general", "other"],
    [
      ["Rocket", "Rocket"],
      ["Award", "Award"],
      ["Trophy", "Trophy"],
      ["FlaskConical", "Flask Conical", ["science"]],
      ["Compass", "Compass"],
      ["Puzzle", "Puzzle"],
      ["Wrench", "Wrench"],
      ["Star", "Star"],
      ["Settings", "Settings"],
      ["Tags", "Tags"],
    ],
  ),
];

const categoryIcons = new Map(
  categoryIconGroups.flatMap(({ icons }) => icons.map((icon) => [icon.name, icon])),
);

export function getCategoryIconLabel(name: string): string {
  const resolved = resolveCategoryIconName(name);
  return (resolved && categoryIcons.get(resolved)?.label) || name || "Choose an icon";
}

export function getRecommendedCategoryColors(name: string) {
  const resolved = resolveCategoryIconName(name);
  const icon = resolved ? categoryIcons.get(resolved) : undefined;
  return icon ? categoryPalettes[icon.defaultPalette] : getFallbackPalette(name);
}

export function searchCategoryIcons(search: string, group: string) {
  const terms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return categoryIconGroups
    .filter(({ label }) => group === "" || label === group)
    .map(({ label, icons }) => ({
      label,
      icons: icons.filter((icon) => {
        const searchable = [icon.name, icon.label, icon.group, ...icon.keywords]
          .join(" ")
          .toLowerCase();
        return terms.every((term) => searchable.includes(term));
      }),
    }))
    .filter(({ icons }) => icons.length > 0);
}
