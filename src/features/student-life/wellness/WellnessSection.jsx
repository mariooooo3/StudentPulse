import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { wellnessData } from '../studentLifeData'
import { SECTION_ACCENTS, SECTION_META, WELLNESS_ICONS } from '../constants/sectionConfig'
import { containerVariants, itemVariants } from '../utils/motionVariants'
import SectionHeader from '../components/SectionHeader'
import AccentLine from '../components/AccentLine'
import PomodoroTimer from './PomodoroTimer'
import FocusForest from './FocusForest'

export default function WellnessSection() {
  const accent = SECTION_ACCENTS.wellness
  return (
    <section className="space-y-6">
      <SectionHeader section="wellness" accent={accent} meta={SECTION_META.wellness} />
      <FocusForest />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <PomodoroTimer />
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg"
                 style={{ background: accent.bg, border: `1px solid ${accent.border}` }}>
              <Heart size={13} style={{ color: accent.color }} strokeWidth={1.8} />
            </div>
            <h3 className="text-sm font-bold text-white">Sfaturi de Wellbeing</h3>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {wellnessData.tips.map(tip => {
              const Icon = WELLNESS_ICONS[tip.icon] || Heart
              return (
                <motion.div key={tip.id} variants={itemVariants} className="premium-card flex gap-3.5 p-4">
                  <AccentLine color={accent.color} />
                  <div
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: accent.bg, border: `1px solid ${accent.border}` }}
                  >
                    <Icon size={15} style={{ color: accent.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{tip.title}</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tip.body}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
