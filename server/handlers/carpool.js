import { query, nowIso } from '../db/database.js'

function readBody(req, maxBytes = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let body = ''
    let size = 0
    req.on('data', chunk => {
      size += Buffer.byteLength(chunk)
      if (size > maxBytes) { req.destroy(); reject(new Error('Body too large')); return }
      body += chunk
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function jsonRes(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  })
  res.end(JSON.stringify(data))
}

async function attachRequests(rides, userId) {
  if (!rides.length) return rides
  const ids = rides.map(r => r.id)
  const { rows: reqs } = await query(
    `SELECT ride_id, passenger_id, passenger_name, status, message, id as req_id
     FROM carpool_requests WHERE ride_id = ANY($1)`,
    [ids]
  )

  const byRide = {}
  for (const r of reqs) {
    if (!byRide[r.ride_id]) byRide[r.ride_id] = []
    byRide[r.ride_id].push(r)
  }

  return rides.map(ride => {
    const requests = byRide[ride.id] || []
    const myRequest = requests.find(r => r.passenger_id === userId) || null
    const acceptedCount = requests.filter(r => r.status === 'accepted').length
    return {
      ...ride,
      isOwn: ride.driver_id === userId,
      myRequest: myRequest ? {
        id: myRequest.req_id,
        status: myRequest.status,
        message: myRequest.message,
      } : null,
      requests: ride.driver_id === userId ? requests.map(r => ({
        id: r.req_id,
        passengerId: r.passenger_id,
        passengerName: r.passenger_name,
        status: r.status,
        message: r.message,
      })) : undefined,
      seatsLeft: ride.seats - acceptedCount,
    }
  })
}

export function createCarpoolHandler() {
  return async function handleCarpool(req, res) {
    const url = req.url || ''
    const method = req.method

    // OPTIONS preflight
    if (method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      })
      res.end(); return
    }

    // ── GET /api/carpool/rides?userId=&from=&to=&date= ───────────────────────
    if (method === 'GET' && url.startsWith('/api/carpool/rides')) {
      const params = new URL(url, 'http://localhost').searchParams
      const userId = params.get('userId') || ''
      const from   = params.get('from')?.toLowerCase() || ''
      const to     = params.get('to')?.toLowerCase() || ''
      const date   = params.get('date') || ''

      const today = new Date().toISOString().slice(0, 10)
      const conditions = [`status != 'cancelled'`, `date >= $1`]
      const args = [today]
      let paramIdx = 2

      if (from) { conditions.push(`LOWER(from_city) LIKE $${paramIdx++}`); args.push(`%${from}%`) }
      if (to)   { conditions.push(`LOWER(to_city) LIKE $${paramIdx++}`);   args.push(`%${to}%`)   }
      if (date) { conditions.push(`date = $${paramIdx++}`);                  args.push(date)        }

      const sql = `SELECT * FROM carpool_rides WHERE ${conditions.join(' AND ')} ORDER BY date ASC, time ASC`
      const { rows: rides } = await query(sql, args)
      return jsonRes(res, 200, { rides: await attachRequests(rides, userId) })
    }

    // ── GET /api/carpool/my-rides?userId= ───────────────────────────────────
    if (method === 'GET' && url.startsWith('/api/carpool/my-rides')) {
      const userId = new URL(url, 'http://localhost').searchParams.get('userId') || ''
      if (!userId) return jsonRes(res, 400, { error: 'userId necesar' })

      const { rows: rides } = await query(
        `SELECT * FROM carpool_rides WHERE driver_id = $1 ORDER BY date ASC, time ASC`,
        [userId]
      )
      return jsonRes(res, 200, { rides: await attachRequests(rides, userId) })
    }

    // ── GET /api/carpool/my-requests?userId= ────────────────────────────────
    if (method === 'GET' && url.startsWith('/api/carpool/my-requests')) {
      const userId = new URL(url, 'http://localhost').searchParams.get('userId') || ''
      if (!userId) return jsonRes(res, 400, { error: 'userId necesar' })

      const { rows: requests } = await query(`
        SELECT cr.*, r.from_city, r.to_city, r.date, r.time, r.driver_name, r.price_per_person
        FROM carpool_requests cr
        JOIN carpool_rides r ON r.id = cr.ride_id
        WHERE cr.passenger_id = $1
        ORDER BY r.date ASC
      `, [userId])

      return jsonRes(res, 200, { requests })
    }

    // ── POST /api/carpool/rides — postează traseu nou ────────────────────────
    if (method === 'POST' && url === '/api/carpool/rides') {
      let parsed
      try { parsed = JSON.parse(await readBody(req)) } catch {
        return jsonRes(res, 400, { error: 'JSON invalid' })
      }

      const { userId, userName, fromCity, fromDetail, toCity, toDetail,
              date, time, seats, pricePerPerson, notes, contact } = parsed

      if (!userId || !userName)     return jsonRes(res, 400, { error: 'userId și userName necesare' })
      if (!fromCity || !toCity)     return jsonRes(res, 400, { error: 'from și to necesare' })
      if (!date || !time)           return jsonRes(res, 400, { error: 'Data și ora sunt necesare' })
      if (!seats || seats < 1)      return jsonRes(res, 400, { error: 'Minim 1 loc' })
      if (!contact?.trim())         return jsonRes(res, 400, { error: 'Contactul este necesar (telefon sau Telegram)' })

      const today = new Date().toISOString().slice(0, 10)
      if (date < today) return jsonRes(res, 400, { error: 'Data nu poate fi în trecut' })

      const id = `ride-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      await query(`
        INSERT INTO carpool_rides
          (id, driver_id, driver_name, from_city, from_detail, to_city, to_detail,
           date, time, seats, price_per_person, notes, contact, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'active', $14)
      `, [id, userId, userName, fromCity.trim(), fromDetail?.trim() || null,
          toCity.trim(), toDetail?.trim() || null, date, time,
          Number(seats), Number(pricePerPerson) || 0, notes?.trim() || null,
          contact.trim(), nowIso()])

      const { rows } = await query('SELECT * FROM carpool_rides WHERE id = $1', [id])
      const ride = rows[0]
      return jsonRes(res, 201, { ride: { ...ride, isOwn: true, myRequest: null, requests: [], seatsLeft: ride.seats } })
    }

    // ── DELETE /api/carpool/rides/:id ───────────────────────────────────────
    const deleteMatch = url.match(/^\/api\/carpool\/rides\/([^/]+)$/)
    if (method === 'DELETE' && deleteMatch) {
      const rideId = deleteMatch[1]
      let body = {}
      try { body = JSON.parse(await readBody(req)) } catch {}

      const { rows } = await query('SELECT * FROM carpool_rides WHERE id = $1', [rideId])
      if (!rows[0]) return jsonRes(res, 404, { error: 'Traseu inexistent' })
      if (rows[0].driver_id !== body.userId) return jsonRes(res, 403, { error: 'Nu poți șterge traseul altcuiva' })

      await query('DELETE FROM carpool_rides WHERE id = $1', [rideId])
      return jsonRes(res, 200, { ok: true })
    }

    // ── POST /api/carpool/rides/:id/join ─────────────────────────────────────
    const joinMatch = url.match(/^\/api\/carpool\/rides\/([^/]+)\/join$/)
    if (method === 'POST' && joinMatch) {
      const rideId = joinMatch[1]
      let parsed
      try { parsed = JSON.parse(await readBody(req)) } catch {
        return jsonRes(res, 400, { error: 'JSON invalid' })
      }

      const { userId, userName, message } = parsed
      if (!userId || !userName) return jsonRes(res, 400, { error: 'userId și userName necesare' })

      const { rows: rideRows } = await query('SELECT * FROM carpool_rides WHERE id = $1', [rideId])
      const ride = rideRows[0]
      if (!ride) return jsonRes(res, 404, { error: 'Traseu inexistent' })
      if (ride.status !== 'active') return jsonRes(res, 400, { error: 'Traseul nu mai este activ' })
      if (ride.driver_id === userId) return jsonRes(res, 400, { error: 'Nu poți cere loc pe propriul traseu' })

      const { rows: countRows } = await query(
        `SELECT COUNT(*) as c FROM carpool_requests WHERE ride_id = $1 AND status = 'accepted'`,
        [rideId]
      )
      const acceptedCount = parseInt(countRows[0].c)
      if (acceptedCount >= ride.seats) return jsonRes(res, 400, { error: 'Nu mai sunt locuri disponibile' })

      const { rows: existingRows } = await query(
        'SELECT * FROM carpool_requests WHERE ride_id = $1 AND passenger_id = $2',
        [rideId, userId]
      )
      if (existingRows[0]) return jsonRes(res, 409, { error: 'Ai trimis deja o cerere pentru acest traseu' })

      const reqId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      await query(`
        INSERT INTO carpool_requests (id, ride_id, passenger_id, passenger_name, message, status, created_at)
        VALUES ($1, $2, $3, $4, $5, 'pending', $6)
      `, [reqId, rideId, userId, userName, message?.trim() || null, nowIso()])

      return jsonRes(res, 201, {
        request: { id: reqId, rideId, status: 'pending', message: message?.trim() || null }
      })
    }

    // ── POST /api/carpool/requests/:reqId/accept ──────────────────────────────
    const acceptMatch = url.match(/^\/api\/carpool\/requests\/([^/]+)\/accept$/)
    if (method === 'POST' && acceptMatch) {
      const reqId = acceptMatch[1]
      let body = {}
      try { body = JSON.parse(await readBody(req)) } catch {}

      const { rows: reqRows } = await query(`
        SELECT cr.*, r.driver_id, r.seats FROM carpool_requests cr
        JOIN carpool_rides r ON r.id = cr.ride_id WHERE cr.id = $1
      `, [reqId])
      const request = reqRows[0]
      if (!request) return jsonRes(res, 404, { error: 'Cerere inexistentă' })
      if (request.driver_id !== body.userId) return jsonRes(res, 403, { error: 'Nu poți accepta cereri pe traseele altora' })

      const { rows: countRows } = await query(
        `SELECT COUNT(*) as c FROM carpool_requests WHERE ride_id = $1 AND status = 'accepted'`,
        [request.ride_id]
      )
      const acceptedCount = parseInt(countRows[0].c)
      if (acceptedCount >= request.seats) return jsonRes(res, 400, { error: 'Nu mai sunt locuri' })

      await query(`UPDATE carpool_requests SET status = 'accepted' WHERE id = $1`, [reqId])

      if (acceptedCount + 1 >= request.seats) {
        await query(`UPDATE carpool_rides SET status = 'full' WHERE id = $1`, [request.ride_id])
      }

      return jsonRes(res, 200, { ok: true, status: 'accepted' })
    }

    // ── POST /api/carpool/requests/:reqId/reject ──────────────────────────────
    const rejectMatch = url.match(/^\/api\/carpool\/requests\/([^/]+)\/reject$/)
    if (method === 'POST' && rejectMatch) {
      const reqId = rejectMatch[1]
      let body = {}
      try { body = JSON.parse(await readBody(req)) } catch {}

      const { rows: reqRows } = await query(`
        SELECT cr.*, r.driver_id FROM carpool_requests cr
        JOIN carpool_rides r ON r.id = cr.ride_id WHERE cr.id = $1
      `, [reqId])
      const request = reqRows[0]
      if (!request) return jsonRes(res, 404, { error: 'Cerere inexistentă' })
      if (request.driver_id !== body.userId) return jsonRes(res, 403, { error: 'Acces interzis' })

      await query(`UPDATE carpool_requests SET status = 'rejected' WHERE id = $1`, [reqId])
      await query(`UPDATE carpool_rides SET status = 'active' WHERE id = $1 AND status = 'full'`, [request.ride_id])

      return jsonRes(res, 200, { ok: true, status: 'rejected' })
    }

    return jsonRes(res, 404, { error: 'Not found' })
  }
}
