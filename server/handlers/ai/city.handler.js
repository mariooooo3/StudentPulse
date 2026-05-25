import { TEXT_MODEL, safeJson } from '../navigation.constants.js'
import { grokChat, readJson, sendJson } from '../navigation.http.js'
import { asArray, asObject, asString } from '../navigation.validation.js'

async function handleCityAssistant(req, res) {
  const body = asObject(await readJson(req))
  const question = asString(body.question, 'question', { required: true, min: 1 })
  const userProfile = body.userProfile ? asObject(body.userProfile, 'userProfile') : {}
  const history = asArray(body.history, 'history')

  const universityName = userProfile.university?.name || userProfile.universityName || 'universitate din România'
  const city = userProfile.university?.city || userProfile.city || 'Iași'
  const faculty = userProfile.faculty || userProfile.detectedFaculty || ''
  const year = userProfile.year || ''

  const systemPrompt = `Ești asistentul de adaptare urbană pentru StudentCompass. Ajuți studenți noi să se adapteze la viața de student în ${city}, România.
Răspunzi ÎNTOTDEAUNA în română, concis și practic. Fii empatic și util.

Studentul: ${year ? year + ' la ' : ''}${faculty ? faculty + ', ' : ''}${universityName}, ${city}.

Poți ajuta cu: documente și acte, transport și abonamente student, cazare, bănci și card student, servicii medicale, viață socială, mâncare și cafenele, studiu.

Reguli:
- Fii specific la ${city} și universitatea studentului
- Maxim 3-4 propoziții, la obiect
- Dacă nu ești sigur de o adresă, număr de telefon sau program exact, nu îl menționa — spune "verifică direct la ghișeu/pe site"
- suggestedNext: exact 2-3 acțiuni concrete, formulate scurt (max 40 caractere), care încep cu un verb la imperativ (ex: "Solicită carnet de student", "Mergi la RATC pentru abonament")
- Răspunde JSON: {"answer": "...", "suggestedNext": ["Verb + acțiune scurtă", "Verb + acțiune scurtă"]}`

  const raw = await grokChat({
    model: TEXT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      ...(Array.isArray(history) ? history.slice(-6) : []),
      { role: 'user', content: String(question || '') },
    ],
    max_tokens: 400,
    response_format: { type: 'json_object' },
  })

  const fallback = {
    answer: `Ca student nou la ${universityName}, primul pas este să mergi la secretariat cu dosarul complet în prima săptămână.`,
    suggestedNext: ['Deschide cont bancar', 'Obține abonament transport'],
  }

  const parsed = safeJson(raw, fallback)
  sendJson(res, 200, {
    answer: String(parsed.answer || fallback.answer),
    suggestedNext: Array.isArray(parsed.suggestedNext) ? parsed.suggestedNext.slice(0, 3).map(String) : fallback.suggestedNext,
  })
}


export { handleCityAssistant }

