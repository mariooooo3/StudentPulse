import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { createNavigationRequestHandler } from '../server/handlers/navigation.js'
import { asArray, asObject, asString } from '../server/handlers/navigation.validation.js'

function makeReq({ method = 'POST', url = '/api/navigation/assistant', body = null } = {}) {
  const payload = body == null ? '' : JSON.stringify(body)
  const req = Readable.from([payload])
  req.method = method
  req.url = url
  return req
}

function makeRes() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    writeHead(code, headers) {
      this.statusCode = code
      this.headers = headers || {}
    },
    end(chunk = '') {
      this.body = String(chunk)
    },
  }
}

const handler = createNavigationRequestHandler()

{
  const req = makeReq({ method: 'GET', url: '/api/navigation/assistant' })
  const res = makeRes()
  await handler(req, res)
  assert.equal(res.statusCode, 404)
}

{
  const req = makeReq({ method: 'OPTIONS', url: '/api/navigation/assistant' })
  const res = makeRes()
  await handler(req, res)
  assert.equal(res.statusCode, 204)
}

{
  assert.throws(() => asObject(null), /must be an object/)
  assert.throws(() => asString('', 'message', { required: true }), /required/)
  assert.deepEqual(asArray(undefined, 'history'), [])
}

console.log('API behavior tests passed.')
