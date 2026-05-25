/**
 * Reads an SSE stream from a POST endpoint.
 * Yields parsed event objects: {t:'c',v:'chunk'} | {t:'d',meta:{...}} | {t:'e',msg:'...'}
 */
export async function* readSSEStream(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`Stream API ${response.status}`)

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try { yield JSON.parse(line.slice(6)) } catch {}
    }
  }
}
