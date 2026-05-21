import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { getUniversityTheme } from '../../shared/utils/theme'
import { useStoredSet } from './hooks/useStoredSet'
import { buildLifeProfile } from './utils/profileUtils'
import PulseSection from './pulse/PulseSection'
import DiscountsSection from './sections/DiscountsSection'
import CareerSection from './career/CareerSection'
import CommunitySection from './sections/CommunitySection'
import EventsSection from './sections/EventsSection'
import WellnessSection from './wellness/WellnessSection'
import ToolsSection from './tools/ToolsSection'

export default function StudentLifeHub({ activeSection = 'discounts', profile, session }) {
  const [saved,  savedOps]  = useStoredSet('sc_saved_v2')
  const [applied, appliedOps] = useStoredSet('sc_applied_v2')
  const [joined, joinedOps] = useStoredSet('sc_joined_v2')
  const [going,  goingOps]  = useStoredSet('sc_going_v1')
  const lifeProfile = useMemo(() => buildLifeProfile(profile, session), [profile, session])
  const theme = getUniversityTheme(session?.university)

  return (
    <motion.div
      key={activeSection}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 80, damping: 18 }}
      className="space-y-6 p-4 sm:p-6"
    >
      {activeSection === 'pulse'     && <PulseSection     lifeProfile={lifeProfile} />}
      {activeSection === 'discounts' && <DiscountsSection lifeProfile={lifeProfile} saved={saved} savedOps={savedOps} />}
      {activeSection === 'career'    && <CareerSection    lifeProfile={lifeProfile} applied={applied} appliedOps={appliedOps} />}
      {activeSection === 'community' && <CommunitySection lifeProfile={lifeProfile} joined={joined} joinedOps={joinedOps} />}
      {activeSection === 'events'    && <EventsSection    lifeProfile={lifeProfile} going={going} goingOps={goingOps} />}
      {activeSection === 'wellness'  && <WellnessSection />}
      {activeSection === 'tools'     && <ToolsSection lifeProfile={lifeProfile} />}
    </motion.div>
  )
}
