import { TEXT_MODEL } from '../navigation.constants.js'
import { grokChat, readJson, sendJson } from '../navigation.http.js'

async function handleSmartMatches(req, res) {
  const body = await readJson(req)
  const { userProfile = {}, pool = [] } = body

  if (!pool.length) { sendJson(res, 200, []); return }

  const raw = await grokChat({
    model: TEXT_MODEL,
    messages: [
      {
        role: 'system',
        content: `Ești un sistem de matching pentru studenți care fac skill-swap (schimb de competențe). Sortezi potențiali parteneri după compatibilitate cu profilul dat.
Răspunzi STRICT cu un array JSON de id-uri sortate descrescător după compatibilitate, fără text suplimentar: ["id1", "id2", ...]

Criterii de compatibilitate (în ordine de importanță):
1. Complementaritate directă (50%): studentul predă exact ce eu vreau să învăț SAU eu predau exact ce el vrea să învețe
2. Interese comune (30%): overlap între listele de interese
3. An de studiu apropiat (20%): diferență de maxim 1 an = bonus mic`,
      },
      {
        role: 'user',
        content: `Sortează acești studenți după compatibilitate cu profilul meu:

Profilul meu:
- Ce predau: ${userProfile.teaches || 'necunoscut'}
- Ce vreau să învăț: ${userProfile.learns || 'necunoscut'}
- Interese: ${JSON.stringify(userProfile.interests || [])}
- An: ${userProfile.year || 'necunoscut'}

Studenți disponibili:
${JSON.stringify(pool.map(p => ({ id: p.id, teaches: p.teaches || '', learns: p.learns || '', interests: p.interests || [], year: p.year })))}

Returnează JSON cu forma: {"ids": ["id1", "id2", ...]} — array-ul cu id-urile sortate descrescător după compatibilitate.`,
      },
    ],
    max_tokens: 200,
    temperature: 0.2,
    response_format: { type: 'json_object' },
  })

  try {
    const parsed = JSON.parse(String(raw || '{}'))
    const sortedIds = Array.isArray(parsed.ids) ? parsed.ids : (() => { const m = String(raw || '').match(/\[[\s\S]*?\]/); return m ? JSON.parse(m[0]) : [] })()
    const idOrder = new Map(sortedIds.map((id, i) => [String(id), i]))
    const sorted = [...pool].sort((a, b) => {
      const ai = idOrder.has(String(a.id)) ? idOrder.get(String(a.id)) : pool.length
      const bi = idOrder.has(String(b.id)) ? idOrder.get(String(b.id)) : pool.length
      return ai - bi
    })
    sendJson(res, 200, sorted.map(u => ({ ...u, match: true })))
  } catch {
    sendJson(res, 200, pool.map(u => ({ ...u, match: true })))
  }
}


export { handleSmartMatches }
