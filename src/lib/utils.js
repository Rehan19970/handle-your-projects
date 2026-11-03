import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge Tailwind classes safely.
 * Used by all UI components to allow custom overrides.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format date into a beautiful readable string
 */
export function formatDate(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Get initials for avatar fallback
 */
export function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}