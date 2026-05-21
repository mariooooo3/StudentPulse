import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import { SECTION_ACCENTS, SECTION_META, TOOLS_TABS } from '../constants/sectionConfig'
import SectionHeader from '../components/SectionHeader'
import AccentLine from '../components/AccentLine'
import BudgetTab from './BudgetTab'
import BooksTab from './BooksTab'
import CarpoolTab from './CarpoolTab'
import RoommateTab from './RoommateTab'

export default function ToolsSection() {
  const accent = SECTION_ACCENTS.tools
  const [toolTab, setToolTab] = useState('Budget')
  const activeTool = TOOLS_TABS.find(t => t.id === toolTab) || TOOLS_TABS[0]
  const ActiveIcon = activeTool.icon

  return (
    <section className="space-y-5">
      <SectionHeader section="tools" accent={accent} meta={SECTION_META.tools} />

      {/* Tool selector grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TOOLS_TABS.map(tool => {
          const Icon   = tool.icon
          const active = toolTab === tool.id
          return (
            <button
              key={tool.id}
              onClick={() => setToolTab(tool.id)}
              className={clsx(
                'rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98]',
                active
                  ? 'shadow-[0_18px_45px_-30px_rgba(99,102,241,0.8)]'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]',
              )}
              style={active ? {
                background: accent.bg,
                borderColor: accent.border,
              } : undefined}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{
                    background: active ? accent.bg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? accent.border : 'rgba(255,255,255,0.07)'}`,
                  }}
                >
                  <Icon size={16} style={{ color: active ? accent.color : undefined }} className={!active ? 'text-slate-500' : undefined} />
                </span>
                <span className="rounded-full border border-white/[0.07] bg-black/20 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-500">
                  {tool.stat}
                </span>
              </div>
              <p className="text-sm font-bold text-white">{tool.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{tool.description}</p>
            </button>
          )
        })}
      </div>

      {/* Active tool hint bar */}
      <div className="premium-card flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <AccentLine color={accent.color} />
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: accent.bg, border: `1px solid ${accent.border}` }}
          >
            <ActiveIcon size={17} style={{ color: accent.color }} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{activeTool.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{activeTool.hint}</p>
          </div>
        </div>
        <span className="w-fit rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1 text-[11px] font-bold text-slate-500 shrink-0">
          Date locale în browser
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={toolTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        >
          {toolTab === 'Budget'       && <BudgetTab />}
          {toolTab === 'Carti'        && <BooksTab />}
          {toolTab === 'Carpool'      && <CarpoolTab />}
          {toolTab === 'Colegi camera' && <RoommateTab />}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
