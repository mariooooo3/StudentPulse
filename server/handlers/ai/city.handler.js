import { TEXT_MODEL } from '../navigation.constants.js'
import { grokStream, readJson, startSSE, sendSSE } from '../navigation.http.js'
import { asArray, asObject, asString } from '../navigation.validation.js'

function getCitySuggestions(question, city) {
  const q = String(question || '').toLowerCase()
  if (q.includes('acte') || q.includes('secretariat') || q.includes('dosar'))
    return ['Deschide cont bancar', 'Obține abonament transport', 'Află despre cazare']
  if (q.includes('transport') || q.includes('abonament') || q.includes('ratc') || q.includes('autobuz'))
    return ['Unde e secretariatul?', 'Cum obțin carnet de student?', 'Ce acte îmi trebuie?']
  if (q.includes('cazare') || q.includes('camin') || q.includes('apartament') || q.includes('chirie'))
    return ['Cum obțin abonament transport?', 'Ce acte îmi trebuie la cazare?', 'Deschide cont bancar']
  if (q.includes('banca') || q.includes('cont') || q.includes('card'))
    return ['Cum obțin carnet de student?', 'Transport student', 'Cazare în campus']
  if (q.includes('mancare') || q.includes('cantina') || q.includes('restaurant'))
    return [`Transport în ${city}`, 'Cazare studenți', 'Card student reduceri']
  return [`Transport în ${city}`, 'Cazare studenți', 'Acte necesare']
}

async function handleCityAssistant(req, res) {
  const body = asObject(await readJson(req))
  const question = asString(body.question, 'question', { required: true, min: 1 })
  const userProfile = body.userProfile ? asObject(body.userProfile, 'userProfile') : {}
  const history = asArray(body.history, 'history')

  const universityName = userProfile.university?.name || userProfile.universityName || 'universitate din România'
  const city = userProfile.university?.city || userProfile.city || 'Iași'
  const faculty = userProfile.faculty || userProfile.detectedFaculty || ''
  const year = userProfile.year || ''

  const systemPrompt = `Ești asistentul de adaptare urbană pentru StudentPulse. Ajuți studenți noi să se adapteze la viața de student în ${city}, România.
Răspunzi ÎNTOTDEAUNA în română, concis și practic. Fii empatic și util.

Studentul: ${year ? year + ' la ' : ''}${faculty ? faculty + ', ' : ''}${universityName}, ${city}.

Poți ajuta cu: documente și acte, transport și abonamente student, cazare, bănci și card student, servicii medicale, viață socială, mâncare și cafenele, studiu.

Reguli:
- Fii specific la ${city} și universitatea studentului
- Maxim 3-4 propoziții, la obiect
- Dacă nu ești sigur de o adresă, număr de telefon sau program exact, nu îl menționa — spune "verifică direct la ghișeu/pe site"
- Răspunde cu text simplu, fără JSON, fără markdown`

  startSSE(res)
  try {
    for await (const chunk of grokStream({
      model: TEXT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...(Array.isArray(history) ? history.slice(-6) : []),
        { role: 'user', content: String(question || '') },
      ],
      max_tokens: 400,
      temperature: 0.6,
    })) {
      sendSSE(res, { t: 'c', v: chunk })
    }
    sendSSE(res, { t: 'd', meta: { suggestedNext: getCitySuggestions(question, city) } })
  } catch {
    sendSSE(res, { t: 'e', msg: `Ca student nou la ${universityName}, primul pas este să mergi la secretariat cu dosarul complet în prima săptămână.` })
    sendSSE(res, { t: 'd', meta: { suggestedNext: getCitySuggestions(question, city) } })
  }
  res.end()
}


export { handleCityAssistant }
