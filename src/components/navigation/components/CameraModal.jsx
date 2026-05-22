import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FlipHorizontal } from 'lucide-react'

export default function CameraModal({
  cameraOpen,
  cameraStream,
  onFlip,
  onClose,
  onCapture,
}) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (cameraOpen && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream
    }
  }, [cameraOpen, cameraStream])

  function capturePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    onCapture(dataUrl)
  }

  return (
    <>
      <AnimatePresence>
        {cameraOpen && (
          <motion.div
            key="camera-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black flex flex-col"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 inset-x-0 z-10">
              <div>
                <p className="text-white font-semibold text-sm">AI Compass</p>
                <p className="text-white/50 text-xs">Fotografia devine context pentru ghidare</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onFlip}
                  className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center"
                  title="Schimbă camera"
                >
                  <FlipHorizontal size={18} className="text-white" />
                </button>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>
            </div>

            {/* Video stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Viewfinder overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-72 h-72">
                <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-lg" />
                <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg" />
                <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-lg" />
                <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-lg" />
              </div>
            </div>

            {/* Capture button */}
            <div className="absolute bottom-0 inset-x-0 pb-10 pt-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center gap-3">
              <p className="text-white/60 text-xs">Poziționează clădirea în cadru</p>
              <button
                onClick={capturePhoto}
                className="w-18 h-18 rounded-full border-4 border-white bg-white/20 hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center"
                style={{ width: 72, height: 72 }}
              >
                <div className="w-14 h-14 rounded-full bg-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <canvas ref={canvasRef} className="hidden" />
    </>
  )
}
