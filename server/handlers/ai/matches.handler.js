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
        content: `Ești un sistem de matching pentru studenți. Sortezi potențiali parteneri de skill-swap după compatibilitate cu profilul dat.
Răspunzi STRICT cu un array JSON de id-uri sortate descrescător după compatibilitate, fără text suplimentar: ["id1", "id2", ...]`,
      },
      {
        role: 'user',
        content: `Sortează acești studenți după compatibilitate cu profilul meu:

Profilul meu:
- Skill-uri oferite: ${JSON.stringify(userProfile.skills || [])}
- Skill-uri dorite: ${JSON.stringify(userProfile.wants || [])}
- Interese: ${JSON.stringify(userProfile.interests || [])}
- An: ${userProfile.year || 'necunoscut'}

Studenți disponibili:
${JSON.stringify(pool.map(p => ({ id: p.id, skills: p.skills || [], wants: p.wants || [], year: p.year })))}

Returnează DOAR array-ul JSON cu id-urile sortate.`,
      },
    ],
    max_tokens: 200,
  })

  try {
    const match = String(raw || '').match(/\[[\s\S]*?\]/)
    const sortedIds = match ? JSON.parse(match[0]) : []
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
