// Lightweight className merger — drop-in for clsx
// Keeps the bundle lean; swap for clsx/cn from shadcn if needed
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
