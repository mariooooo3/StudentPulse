import { TEXT_MODEL } from '../navigation.constants.js'
import { grokStream, readJson, startSSE, sendSSE } from '../navigation.http.js'
import { asArray, asObject, asString } from '../navigation.validation.js'

async function handleSupportAssistant(req, res) {
  const body = asObject(await readJson(req))
  const context = body.context ? asObject(body.context, 'context') : {}
  const fallbackSuggestions = context.role === 'professor'
    ? ['Ce pot gestiona aici?', 'Cum functioneaza cererile de licenta?', 'Cum functioneaza mesajele?']
    : ['Ce pot face aici?', 'Deschide Campus Navigator', 'Cum functioneaza cererile de licenta?']

  startSSE(res)
  try {
    for await (const chunk of grokStream({
      model: TEXT_MODEL,
      messages: [
        {
          role: 'system',
          content: `Esti asistentul virtual de suport din StudentCompass.
Raspunde intotdeauna in romana. Fii concis, practic si orientat pe produs.

Poti ajuta cu:
- acces la cont, email institutional, onboarding si profil
- module de student: Dashboard, Campus Navigator, Schedule Hub, Thesis Finder, Peer Tutoring, Messages, Student Life, City Adaptation
- module de profesor: dashboard, profil academic, cereri de licenta, cereri de recuperare si mesaje
- intrebari de baza despre viata studenteasca

Reguli:
- Nu spune ca ai modificat datele contului daca utilizatorul nu a folosit un control din aplicatie.
- Nu inventa politici, note, sfaturi juridice/medicale/financiare sau date private.
- Daca intrebarea este in afara StudentCompass, raspunde scurt daca este ceva de baza; altfel redirectioneaza catre ce poate face aplicatia.
- Foloseste campul "currentView" si "currentLabel" din context pentru a da raspunsuri relevante pentru sectiunea curenta.
- Maxim 3 propozitii clare si directe.
- Raspunde cu text simplu, fara JSON, fara markdown.`,
        },
        {
          role: 'user',
          content: `Contextul curent al aplicatiei:
${JSON.stringify({
  role: context.role,
  university: context.university,
  faculty: context.faculty || context.detectedFaculty,
  year: context.year,
  platformMode: context.platformMode,
  currentView: context.currentView,
  currentLabel: context.currentLabel,
})}

Conversatia recenta:
${JSON.stringify(asArray(body.history, 'history').slice(-8))}

Intrebarea utilizatorului:
${asString(body.message, 'message')}`,
        },
      ],
      max_tokens: 520,
      temperature: 0.6,
    })) {
      sendSSE(res, { t: 'c', v: chunk })
    }
    sendSSE(res, { t: 'd', meta: { suggestions: fallbackSuggestions } })
  } catch {
    sendSSE(res, { t: 'e', msg: 'Te pot ajuta cu intrebari despre cont, module, mesaje, orar, cereri de licenta si viata studenteasca.' })
    sendSSE(res, { t: 'd', meta: { suggestions: fallbackSuggestions } })
  }
  res.end()
}

export { handleSupportAssistant }
