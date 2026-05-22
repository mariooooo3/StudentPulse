export function useCampusNavigatorCamera({
  cameraStream,
  cameraFacing,
  setCameraOpen,
  setCameraStream,
  setCameraFacing,
}) {
  function attachmentFromDataUrl(dataUrl, mimeType = 'image/jpeg') {
    const [, base64 = ''] = String(dataUrl || '').split(',')
    return { base64, mimeType }
  }

  async function openCamera(facing = 'environment') {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing } },
        audio: false,
      })
      setCameraFacing(facing)
      setCameraStream(stream)
      setCameraOpen(true)
    } catch (err) {
      console.warn('[Camera] Nu s-a putut accesa camera:', err?.message || err)
    }
  }

  function closeCamera() {
    cameraStream?.getTracks().forEach(t => t.stop())
    setCameraStream(null)
    setCameraOpen(false)
  }

  async function flipCamera() {
    cameraStream?.getTracks().forEach(t => t.stop())
    const next = cameraFacing === 'environment' ? 'user' : 'environment'
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: next } },
        audio: false,
      })
      setCameraFacing(next)
      setCameraStream(stream)
      setCameraOpen(true)
    } catch (err) {
      console.warn('[Camera] Nu s-a putut schimba camera:', err?.message || err)
    }
  }

  return { attachmentFromDataUrl, openCamera, closeCamera, flipCamera }
}
