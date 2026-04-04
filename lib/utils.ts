import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const URL_REGEX = /(https?:\/\/[^\s<]+)/g

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function linkify(text: string): string {
  return escapeHtml(text).replace(
    URL_REGEX,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="underline">$1</a>'
  )
}
