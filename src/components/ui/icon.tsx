import { Icon as IconifyIcon } from "@iconify/react";
import { cn } from "@/lib/utils";

/**
 * Unified Icon component that uses Iconify Material Design Icons.
 * 
 * Usage:
 * <Icon name="mdi:table-box-multiple-outline" className="w-6 h-6" />
 * <Icon name="mdi:book-open-page-variant-outline" size={24} />
 * 
 * Common MDI icons for the library system:
 * - mdi:table-box-multiple-outline (electronic resources grid)
 * - mdi:book-open-page-variant-outline (open book)
 * - mdi:chart-box-outline (statistics)
 * - mdi:video-box (video/media)
 * - mdi:library (library)
 * - mdi:book-multiple (multiple books)
 * - mdi:newspaper-variant-outline (news)
 * - mdi:calendar-month-outline (events)
 * - mdi:home-outline (home)
 * - mdi:cog-outline (settings)
 * - mdi:magnify (search)
 * - mdi:plus (add)
 * - mdi:pencil-outline (edit)
 * - mdi:delete-outline (delete)
 * - mdi:check (check)
 * - mdi:close (close)
 * - mdi:arrow-left / mdi:arrow-right (navigation)
 * - mdi:chevron-left / mdi:chevron-right (chevrons)
 * - mdi:account-outline (user)
 * - mdi:earth (globe)
 * - mdi:download (download)
 * - mdi:upload (upload)
 * - mdi:eye-outline (view)
 * - mdi:image-outline (image)
 * - mdi:file-document-outline (document)
 * - mdi:folder-outline (folder)
 * - mdi:palette-outline (design/colors)
 * - mdi:format-text (typography)
 * - mdi:view-grid-outline (grid)
 * - mdi:link-variant (link)
 * - mdi:bookmark-outline (bookmark)
 * - mdi:star-outline (star/featured)
 * - mdi:bell-outline (notifications)
 * - mdi:filter-outline (filter)
 * - mdi:sort (sort)
 * - mdi:refresh (refresh)
 * - mdi:content-save-outline (save)
 * - mdi:information-outline (info)
 * - mdi:alert-outline (warning)
 * - mdi:help-circle-outline (help)
 */

interface IconProps {
  /** Icon name in format "mdi:icon-name" or just "icon-name" (defaults to mdi prefix) */
  name: string;
  /** Size in pixels (alternative to className width/height) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
  /** Color (uses currentColor by default) */
  color?: string;
  /** Inline style object */
  style?: React.CSSProperties;
  /** onClick handler */
  onClick?: () => void;
  /** Accessibility label */
  "aria-label"?: string;
  /** Hide from screen readers (accepts boolean or "true"/"false" string) */
  "aria-hidden"?: boolean | "true" | "false";
}

export function Icon({
  name,
  size,
  className,
  color,
  style,
  onClick,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden = true,
}: IconProps) {
  // Default to mdi prefix if not specified
  const iconName = name.includes(":") ? name : `mdi:${name}`;

  return (
    <IconifyIcon
      icon={iconName}
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      color={color}
      style={style}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
    />
  );
}

// Common icon presets for the library system
export const IconNames = {
  // Section icons
  electronicResources: "mdi:select-multiple",
  ibnBattoutaStats: "mdi:format-list-numbered",
  latestAdditions: "mdi:book-open-page-variant-outline",
  mediatheque: "mdi:video-box",
  library: "mdi:library",
  books: "mdi:book-multiple",
  news: "mdi:newspaper-variant-outline",
  events: "mdi:calendar-month-outline",
  
  // Navigation
  home: "mdi:home-outline",
  arrowLeft: "mdi:arrow-left",
  arrowRight: "mdi:arrow-right",
  chevronLeft: "mdi:chevron-left",
  chevronRight: "mdi:chevron-right",
  chevronUp: "mdi:chevron-up",
  chevronDown: "mdi:chevron-down",
  menu: "mdi:menu",
  
  // Actions
  search: "mdi:magnify",
  add: "mdi:plus",
  edit: "mdi:pencil-outline",
  delete: "mdi:delete-outline",
  save: "mdi:content-save-outline",
  check: "mdi:check",
  close: "mdi:close",
  refresh: "mdi:refresh",
  download: "mdi:download",
  upload: "mdi:upload",
  
  // Content
  document: "mdi:file-document-outline",
  folder: "mdi:folder-outline",
  image: "mdi:image-outline",
  video: "mdi:video-outline",
  link: "mdi:link-variant",
  externalLink: "mdi:open-in-new",
  
  // User & Auth
  user: "mdi:account-outline",
  users: "mdi:account-group-outline",
  login: "mdi:login",
  logout: "mdi:logout",
  
  // Design & Settings
  palette: "mdi:palette-outline",
  typography: "mdi:format-text",
  settings: "mdi:cog-outline",
  grid: "mdi:view-grid-outline",
  
  // Status & Feedback
  info: "mdi:information-outline",
  warning: "mdi:alert-outline",
  error: "mdi:alert-circle-outline",
  success: "mdi:check-circle-outline",
  help: "mdi:help-circle-outline",
  
  // Features
  bookmark: "mdi:bookmark-outline",
  star: "mdi:star-outline",
  heart: "mdi:heart-outline",
  bell: "mdi:bell-outline",
  filter: "mdi:filter-outline",
  sort: "mdi:sort",
  
  // Misc
  globe: "mdi:earth",
  eye: "mdi:eye-outline",
  eyeOff: "mdi:eye-off-outline",
  lock: "mdi:lock-outline",
  unlock: "mdi:lock-open-outline",
  calendar: "mdi:calendar-outline",
  clock: "mdi:clock-outline",
  loader: "mdi:loading",
} as const;

export default Icon;
