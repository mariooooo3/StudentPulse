import { VISION_MODEL } from '../navigation.constants.js'
import { grokChat, readJson, sendJson } from '../navigation.http.js'
import { PHOTO_PROMPT_UAIC, PHOTO_PROMPT_TUIASI } from './prompts.js'
import { asObject, asString } from '../navigation.validation.js'

async function handlePhoto(req, res) {
  const body = asObject(await readJson(req))
  const base64 = asString(body.base64, 'base64', { required: true, min: 10 })
  const mimeType = body.mimeType || 'image/jpeg'
  const university = body.university || 'tuiasi'
  const prompt = university === 'uaic' ? PHOTO_PROMPT_UAIC : PHOTO_PROMPT_TUIASI

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
