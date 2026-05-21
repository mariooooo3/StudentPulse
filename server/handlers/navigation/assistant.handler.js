import { TEXT_MODEL, SYSTEM_PROMPT } from '../navigation.constants.js'
import { grokChat, readJson, sendJson } from '../navigation.http.js'
import { asArray, asObject, asString } from '../navigation.validation.js'

async function handleAssistant(req, res) {
  const body = asObject(await readJson(req))
  const message = asString(body.message, 'message', { required: true, min: 1 })
  const history = asArray(body.history, 'history')
  const answer = await grokChat({
    model: TEXT_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-8),
      { role: 'user', content: message },
    ],
    max_tokens: 420,
  })
  sendJson(res, 200, { answer })
}


export { handleAssistant }
