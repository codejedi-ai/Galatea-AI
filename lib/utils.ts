import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Classnames utility. No environment variable access here.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
