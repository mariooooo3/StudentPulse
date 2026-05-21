import { useEffect, useState } from 'react'
import { Clock, Edit3, Layers, Save } from 'lucide-react'
import { consultationHoursFor } from '../utils/professorUtils'

export default function ProfileView({ professor, onSave }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    domain: professor.domain || '',
    room: professor.room || '',
    phone: professor.phone || '',
    assistant: professor.assistant || '',
    research: (professor.research || []).join(', '),
  })

  useEffect(() => {
    setForm({
      domain: professor.domain || '',
      room: professor.room || '',
      phone: professor.phone || '',
      assistant: professor.assistant || '',
      research: (professor.research || []).join(', '),
    })
  }, [professor])

  function save() {
    onSave({ ...form, research: form.research.split(',').map(item => item.trim()).filter(Boolean) })
    setEditing(false)
  }

  return (
    <div className="p-6 space-y-5">
      {/* Profile hero */}
      <section className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(245,158,11,0.06),transparent_60%)]" />
        <div className="flex flex-col lg:flex-row lg:items-start gap-5 relative">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-200 text-xl font-bold shrink-0 shadow-[0_0_24px_rgba(245,158,11,0.12)]">
            {professor.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <p className="section-label text-amber-400 mb-1">{professor.title}</p>
            <h2 className="text-2xl font-bold text-white tracking-tight">{professor.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{professor.facultyName} · {professor.email}</p>
          </div>
          <button
            onClick={() => editing ? save() : setEditing(true)}
            className="btn-primary inline-flex items-center gap-2 text-sm self-start"
          >
            {editing ? <Save size={14} /> : <Edit3 size={14} />}
            {editing ? 'Salveaza' : 'Editeaza'}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
        {/* Form fields */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 space-y-4">
          {[
            ['domain', 'Domeniu coordonare'],
            ['room', 'Birou'],
            ['phone', 'Telefon secretariat/birou'],
            ['assistant', 'Asistent / colaborator'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="section-label block mb-2">{label}</label>
              {editing ? (
                <input
                  value={form[key]}
                  onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  className="input-base w-full text-sm focus:border-amber-500/40"
                />
              ) : (
                <p className="text-sm text-slate-300 rounded-xl border border-white/[0.05] bg-[#070b14]/60 px-3 py-2.5">
                  {professor[key] || <span className="text-slate-600 italic">Necompletat</span>}
                </p>
              )}
            </div>
          ))}
          <div>
            <label className="section-label block mb-2">Directii cercetare</label>
            {editing ? (
              <input
                value={form.research}
                onChange={e => setForm(prev => ({ ...prev, research: e.target.value }))}
                className="input-base w-full text-sm focus:border-amber-500/40"
                placeholder="Separa cu virgula"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {professor.research?.map(item => (
                  <span key={item} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-300 font-medium">
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side panels */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Clock size={14} className="text-amber-400" />
              Program public de consultatii
            </p>
            {consultationHoursFor(professor).map(slot => (
              <div key={slot.id} className="rounded-xl border border-white/[0.05] bg-[#070b14]/60 px-3 py-2 mb-2 last:mb-0">
                <p className="text-sm font-semibold text-slate-200">{slot.day}, {slot.time}</p>
                <p className="text-xs text-slate-600 mt-0.5">{slot.place} · {slot.mode}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Layers size={14} className="text-amber-400" />
              Cursuri publicate
            </p>
            {professor.courses?.map(course => (
              <div key={course.id} className="rounded-xl border border-white/[0.05] bg-[#070b14]/60 px-3 py-2 mb-2 last:mb-0">
                <p className="text-sm font-semibold text-slate-200">{course.name}</p>
                <p className="text-xs text-slate-600 mt-0.5">{course.groups.join(', ')} · {course.next}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
