import { TEXT_MODEL, getSystemPrompt } from '../navigation.constants.js'
import { grokStream, readJson, startSSE, sendSSE } from '../navigation.http.js'
import { asArray, asObject, asString } from '../navigation.validation.js'

async function handleAssistant(req, res) {
  const body = asObject(await readJson(req))
  const message = asString(body.message, 'message', { required: true, min: 1 })
  const history = asArray(body.history, 'history')
  const university = String(body.university || 'tuiasi').toLowerCase()

  startSSE(res)
  try {
    for await (const chunk of grokStream({
      model: TEXT_MODEL,
      messages: [
        { role: 'system', content: getSystemPrompt(university) },
        ...history.slice(-8),
        { role: 'user', content: message },
      ],
      max_tokens: 600,
      temperature: 0.5,
    })) {
      sendSSE(res, { t: 'c', v: chunk })
    }
    sendSSE(res, { t: 'd' })
  } catch {
    sendSSE(res, { t: 'e', msg: 'Momentan nu pot răspunde.' })
  }
  res.end()
}


export { handleAssistant }
