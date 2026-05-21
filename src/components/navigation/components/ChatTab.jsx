import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, X, Loader2, LocateFixed, Camera, ImagePlus } from 'lucide-react'
import VisualCopilotCard from './CopilotCard'

export default function ChatTab({
  chatMessages,
  chatLoading,
  chatAttachment,
  chatInput,
  AI_COMPASS_DESTINATIONS,
  setChatInput,
  setChatAttachment,
  onSubmit,
  onStartLostMode,
  onOpenCamera,
  onSelectDestination,
  onApplyRoute,
  onStartPresentation,
}) {
  const chatFileInputRef = useRef(null)
  const chatBottomRef = useRef(null)

  useEffect(() => {
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, [chatMessages])

  function handleChatPhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      const attachment = {
        preview: dataUrl,
        base64: dataUrl.split(',')[1],
        mimeType: file.type || 'image/jpeg',
      }
      onSubmit(chatInput, attachment)
      e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  function sendChat(e) {
    e.preventDefault()
    onSubmit(chatInput, chatAttachment)
  }

  return (
    <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden h-[70dvh] min-h-[520px] flex flex-col">
      <div className="p-4 border-b border-white/[0.05] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AI Compass</p>
            <p className="text-xs text-slate-500">Chat, poza si ghidare campus</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onStartLostMode}
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/[0.08] px-3 text-xs font-bold text-rose-100 transition-colors hover:bg-rose-500/[0.13] active:scale-[0.98]"
        >
          <LocateFixed size={14} />
          M-am rătăcit
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence initial={false}>
          {chatMessages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : 'bg-white/[0.05] text-slate-200 rounded-bl-md'
              }`}>
                {msg.imagePreview && (
                  <img
                    src={msg.imagePreview}
                    alt="Poza atasata pentru analiza de navigatie"
                    className="mb-2 max-h-44 w-full rounded-xl object-cover border border-white/[0.12]"
                  />
                )}
                {msg.copilot ? (
                  <VisualCopilotCard result={msg.copilot} onStartRoute={onApplyRoute} onStartPresentation={onStartPresentation} />
                ) : (
                  <>
                    {msg.text}
                    {msg.destinationOptions?.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {msg.destinationOptions.map(option => (
                          <button
                            key={option.label}
                            type="button"
                            onClick={() => onSelectDestination(option)}
                            disabled={chatLoading}
                            className="min-h-11 rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-3 py-2 text-left hover:bg-indigo-500/20 disabled:opacity-50 transition-colors"
                          >
                            <span className="block text-sm font-semibold text-white">{option.label}</span>
                            <span className="block text-[10px] uppercase tracking-widest text-indigo-200/70">{option.type}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))}
          {chatLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white/[0.05] px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-indigo-400" />
                <span className="text-sm text-slate-400">Gândesc...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatBottomRef} />
      </div>

      <form onSubmit={sendChat} className="p-3 sm:p-4 border-t border-white/[0.05]">
        {chatAttachment && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-2">
            <img
              src={chatAttachment.preview}
              alt="Preview poza atasata"
              className="h-14 w-20 rounded-lg object-cover border border-white/[0.08]"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-200">Poza atasata pentru Copilot</p>
              <p className="text-[11px] text-slate-500">Scrie destinatia sau intreaba unde esti.</p>
            </div>
            <button
              type="button"
              onClick={() => setChatAttachment(null)}
              className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-slate-400"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div className="flex gap-2 sm:gap-3">
          <input ref={chatFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleChatPhoto} />
          <button
            type="button"
            onClick={() => chatFileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/[0.07] transition-colors cursor-pointer"
            title="Ataseaza poza"
          >
            <ImagePlus size={18} />
          </button>
          <button
            type="button"
            onClick={() => onOpenCamera('environment')}
            className="p-2.5 rounded-xl bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/[0.07] transition-colors cursor-pointer"
            title="Fa poza"
          >
            <Camera size={18} />
          </button>
          <input
            type="text"
            placeholder="Unde e sala C310? Cum ajung la cantină?..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="min-w-0 flex-1 px-3 sm:px-4 py-2.5 rounded-xl bg-white/[0.03] text-slate-200 border border-white/[0.07] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm placeholder:text-slate-600"
          />
          <button type="submit" disabled={(!chatInput.trim() && !chatAttachment) || chatLoading}
            className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer">
            <Send size={18} />
          </button>
        </div>
      </form>
    </motion.div>
  )
}
