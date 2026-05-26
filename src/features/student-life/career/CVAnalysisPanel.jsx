import { useCallback, useRef, useState } from 'react'
import {
  AlertCircle,
  Bot,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'
import { CV_API_URL, extractTextFromPDF } from './cvUtils'
import AccentLine from '../components/AccentLine'

export default function CVAnalysisPanel({ allJobs, onAnalysis, cvAnalysis, lifeProfile }) {
  const [cvText, setCvText] = useState('')
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const fileRef = useRef(null)

  async function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Fișierul e prea mare. Maxim 5MB.'); return }
    setError('')
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (isPDF) {
      setExtracting(true)
      try {
        const arrayBuffer = await file.arrayBuffer()
        const text = await extractTextFromPDF(arrayBuffer)
        if (text.length > 30) {
          setCvText(text)
        } else {
          setError('Nu am putut extrage text din PDF. Încearcă să copiezi conținutul manual.')
        }
      } catch {
        setError('Eroare la citirea PDF-ului. Încearcă să copiezi conținutul manual.')
      } finally {
        setExtracting(false)
      }
    } else {
      const reader = new FileReader()
      reader.onload = ev => {
        const text = ev.target.result
        if (text && text.trim().length > 30) {
          setCvText(text.trim())
        } else {
          setError('Nu am putut citi textul din fișier.')
        }
      }
      reader.onerror = () => setError('Eroare la citirea fișierului.')
      reader.readAsText(file)
    }
    e.target.value = ''
  }

  const analyze = useCallback(async () => {
    if (cvText.trim().length < 30) { setError('CV-ul e prea scurt. Adaugă mai mult conținut.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(CV_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvText: cvText.trim(),
          jobs: allJobs.map(j => ({ id: j.id, role: j.role, company: j.company, tags: j.tags, type: j.type })),
          facultyContext: lifeProfile ? `${lifeProfile.facultyName}, Anul ${lifeProfile.year}, ${lifeProfile.city}` : '',
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Eroare server ${res.status}`)
      }
      const data = await res.json()
      onAnalysis(data)
      setOpen(false)
    } catch (err) {
      setError(err.message || 'Eroare la analiză. Încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }, [cvText, allJobs, onAnalysis])

  if (cvAnalysis) {
    return (
      <div className="premium-card p-5 space-y-3">
        <AccentLine color="#3b82f6" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/12 border border-blue-500/20">
              <Bot size={14} className="text-blue-400" strokeWidth={1.75} />
            </div>
            <span className="text-sm font-bold text-blue-300">Analiză CV</span>
            <span className="badge-blue">{cvAnalysis.experienceLevel}</span>
          </div>
          <button onClick={() => { onAnalysis(null); setOpen(false) }} className="btn-ghost p-1.5">
            <X size={14} />
          </button>
        </div>
        {cvAnalysis.summary && (
          <p className="text-sm text-slate-400 leading-relaxed">{cvAnalysis.summary}</p>
        )}
        {cvAnalysis.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {cvAnalysis.skills.map(skill => (
              <span key={skill} className="badge-blue">{skill}</span>
            ))}
          </div>
        )}
        <button onClick={() => setOpen(true)} className="text-[11px] text-slate-600 hover:text-blue-400 transition-colors underline underline-offset-2">
          Actualizează CV-ul
        </button>
        {open && (
          <div className="pt-3 space-y-3 border-t border-white/[0.06]">
            <textarea
              value={cvText}
              onChange={e => { setCvText(e.target.value); setError('') }}
              rows={5}
              placeholder="Lipește conținutul CV-ului..."
              className="input-base resize-none"
            />
            {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
            <div className="flex items-center gap-2">
              <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" onChange={onFile} />
              <button onClick={() => fileRef.current?.click()} disabled={extracting}
                className="btn-secondary text-xs h-9 px-3 disabled:opacity-50 disabled:cursor-not-allowed">
                {extracting ? <><Loader2 size={12} className="animate-spin" /> Se citește...</> : <><Upload size={12} /> PDF / TXT</>}
              </button>
              <button onClick={analyze} disabled={loading || cvText.trim().length < 30}
                className="btn-primary text-sm h-9 px-4 ml-auto disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <><Loader2 size={14} className="animate-spin" /> Analizez...</> : 'Actualizează'}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="premium-card w-full flex items-center gap-4 p-4 text-left"
      >
        <AccentLine color="#3b82f6" />
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/12 border border-blue-500/20 shrink-0">
          <Bot size={17} className="text-blue-400" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">Analizează CV-ul cu AI</p>
          <p className="text-xs text-slate-500">Potrivire personalizată bazată pe experiența ta reală</p>
        </div>
        <Sparkles size={14} className="text-blue-400 shrink-0" strokeWidth={1.75} />
      </button>
    )
  }

  return (
    <div className="premium-card p-5 space-y-3">
      <AccentLine color="#3b82f6" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/12 border border-blue-500/20">
            <Bot size={14} className="text-blue-400" strokeWidth={1.75} />
          </div>
          <span className="text-sm font-bold text-blue-300">Analizează CV-ul cu AI</span>
        </div>
        <button onClick={() => setOpen(false)} className="btn-ghost p-1.5"><X size={14} /></button>
      </div>
      <p className="text-xs text-slate-500">Încarcă CV-ul ca <span className="text-slate-400">.pdf</span> sau <span className="text-slate-400">.txt</span>, sau lipește textul direct.</p>
      <textarea
        value={cvText}
        onChange={e => { setCvText(e.target.value); setError('') }}
        rows={6}
        placeholder="Lipește conținutul CV-ului tău: educație, experiență, skill-uri, proiecte..."
        className="input-base resize-none"
      />
      {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
      <div className="flex items-center gap-2">
        <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" onChange={onFile} />
        <button onClick={() => fileRef.current?.click()} disabled={extracting}
          className="btn-secondary text-xs h-9 px-3 disabled:opacity-50 disabled:cursor-not-allowed">
          {extracting ? <><Loader2 size={12} className="animate-spin" /> Se citește PDF...</> : <><Upload size={12} /> Încarcă PDF / TXT</>}
        </button>
        <button onClick={analyze} disabled={loading || cvText.trim().length < 30}
          className="btn-primary text-sm h-9 px-4 ml-auto disabled:opacity-50 disabled:cursor-not-allowed">
          {loading
            ? <><Loader2 size={14} className="animate-spin" /> Analizez...</>
            : <><FileText size={14} /> Analizează</>}
        </button>
      </div>
    </div>
  )
}
