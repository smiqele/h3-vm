import type { HTMLAttributes } from "react";
import {
  Archive, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, CircleAlert, CircleCheck, CircleX, Columns3, Copy,
  Cloud, Cpu, CreditCard, Database, Disc3, Ellipsis, Globe2, HardDrive, Images, Info, KeyRound,
  GripVertical, Layers3, LoaderCircle, Lock, MemoryStick, MessageCircle, Moon, Network, Plus, Route, Search, Server,
  PcCase, Settings2, Shield, SlidersHorizontal, Sparkles, Sun, Terminal, TriangleAlert, TrendingUp, Users, X,
  type LucideIcon,
} from "lucide-react";
import styles from "./Icon.module.css";

export const iconRegistry = {
  check: Check,
  "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevrons-up-down": ChevronsUpDown,
  "circle-alert": CircleAlert,
  "circle-check": CircleCheck,
  "circle-x": CircleX,
  cloud: Cloud,
  "columns-3": Columns3,
  copy: Copy,
  cpu: Cpu,
  archive: Archive,
  billing: CreditCard,
  database: Database,
  disc: Disc3,
  ellipsis: Ellipsis,
  "hard-drive": HardDrive,
  images: Images,
  info: Info,
  loader: LoaderCircle,
  lock: Lock,
  memory: MemoryStick,
  moon: Moon,
  network: Network,
  layers: Layers3,
  route: Route,
  shield: Shield,
  globe: Globe2,
  "grip-vertical": GripVertical,
  users: Users,
  key: KeyRound,
  sparkles: Sparkles,
  message: MessageCircle,
  plus: Plus,
  "pc-case": PcCase,
  search: Search,
  server: Server,
  settings: Settings2,
  filter: SlidersHorizontal,
  sun: Sun,
  terminal: Terminal,
  "triangle-alert": TriangleAlert,
  "trending-up": TrendingUp,
  x: X,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconRegistry;
export type IconSize = "sm" | "md" | "lg" | "inherit";

export interface IconProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  name: IconName;
  size?: IconSize;
  label?: string;
}

export const iconNames = Object.keys(iconRegistry) as IconName[];

export function Icon({ name, size = "md", label, className, ...props }: IconProps) {
  const Glyph = iconRegistry[name];
  return <span {...props} className={[styles.icon, className].filter(Boolean).join(" ")} data-size={size} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
    <Glyph/>
  </span>;
}
