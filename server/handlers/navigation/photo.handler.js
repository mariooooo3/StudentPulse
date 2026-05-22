import { VISION_MODEL } from '../navigation.constants.js'
import { grokChat, readJson, sendJson } from '../navigation.http.js'
import {
  PHOTO_PROMPT_UAIC,
  PHOTO_PROMPT_TUIASI,
  PHOTO_PROMPT_UMF_IASI,
  PHOTO_PROMPT_UMF_BUC,
  PHOTO_PROMPT_UMF_TGM,
  PHOTO_PROMPT_UMF_CRAIOVA,
} from './prompts.js'
import { asObject, asString } from '../navigation.validation.js'

async function handlePhoto(req, res) {
  const body = asObject(await readJson(req))
  const base64 = asString(body.base64, 'base64', { required: true, min: 10 })
  const mimeType = body.mimeType || 'image/jpeg'
  const university = body.university || 'tuiasi'
  const coords = Array.isArray(body.coords) && body.coords.length === 2 ? body.coords : null
  const PROMPTS = {
    uaic:         PHOTO_PROMPT_UAIC,
    tuiasi:       PHOTO_PROMPT_TUIASI,
    'umf-iasi':   PHOTO_PROMPT_UMF_IASI,
    'umf-buc':    PHOTO_PROMPT_UMF_BUC,
    'umf-tgm':    PHOTO_PROMPT_UMF_TGM,
    'umf-craiova':PHOTO_PROMPT_UMF_CRAIOVA,
  }
  const basePrompt = PROMPTS[university] ?? PHOTO_PROMPT_TUIASI
  const coordsNote = coords
    ? `\n\nCONTEXT GPS: Studentul se află la coordonatele ${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}. Folosește această informație pentru a crește acuratețea identificării — locația confirmă că se află pe campusul universității menționate.`
    : ''
  const prompt = basePrompt + coordsNote

  const rawAnswer = await grokChat({
    model: VISION_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
          { type: 'text', text: prompt },
        ],
      },
    ],
    max_tokens: 480,
  })
  sendJson(res, 200, { answer: rawAnswer })
}


export { handlePhoto }
