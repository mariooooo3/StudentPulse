export const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.065 } },
}
export const itemVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  show:   { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { type: 'spring', stiffness: 90, damping: 20 } },
}
export const entryVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0  },
  transition: { type: 'spring', stiffness: 80, damping: 18 },
}
