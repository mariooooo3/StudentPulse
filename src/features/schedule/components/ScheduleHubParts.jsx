import { useEffect, useState } from 'react'
import { Check, Zap, MessageSquare, Users, CalendarClock, GraduationCap, BookOpen, ArrowLeftRight, Repeat2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { DAYS, HOURS } from '../../../shared/data/mockData'
import { socketService } from '../../../shared/services/socket.service'
import { staggerContainer, staggerItem, fadeUp } from '../schedule.constants'
import RecoveryGridComponent from './RecoveryGrid'
import SlotSwapViewComponent from './SlotSwapView'
import WeeklyViewComponent, { ROW_H, COURSE_TYPE_BORDER } from './WeeklyView'
import AllGroupsViewComponent from './AllGroupsView'
import ExamMapViewComponent from './ExamMapView'
import GradeCalculatorViewComponent from './GradeCalculatorView'
import clsx from 'clsx'

export function availColor(slot) {
  if (slot.isMine) return 'bg-indigo-600/40 border-indigo-400 text-indigo-300'
  const free = slot.total - slot.enrolled
  if (free === 0) return 'bg-rose-900/40 border-rose-700/50 text-rose-400'
  if (free <= 2)  return 'bg-amber-900/40 border-amber-700/50 text-amber-300'
  return 'bg-emerald-900/40 border-emerald-700/50 text-emerald-300'
}
export function availLabel(slot) {
  if (slot.isMine) return 'ORA TA'
  const free = slot.total - slot.enrolled
  if (free === 0) return 'COMPLET'
  return `${free} locuri`
}

export const RecoveryGrid = RecoveryGridComponent
export const SlotSwapView = SlotSwapViewComponent

export const WeeklyView = WeeklyViewComponent
export const AllGroupsView = AllGroupsViewComponent

export const ExamMapView = ExamMapViewComponent
export const GradeCalculatorView = GradeCalculatorViewComponent
