import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina classes do TailwindCSS de forma inteligente,
 * resolvendo conflitos (ex: 'p-2' e 'p-4' -> 'p-4').
 * Usado por todos os componentes Shadcn/ui.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}