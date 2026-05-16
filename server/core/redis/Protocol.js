// Binary protocol — direct port of framing logic from 14_server.cpp
// Request: [4B nstr][4B len][str]... repeated nstr times
// Response: [4B msglen][1B tag][data]

const MAX_MSG = 32 * 1024 * 1024  // 32MB — same as C++
const MAX_ARGS = 200_000

export const TAG = { NIL: 0, ERR: 1, STR: 2, INT: 3, DBL: 4, ARR: 5 }

export class Protocol {
  static parseRequest(buf) {
    if (buf.length < 4) return null
    const msgLen = buf.readUInt32LE(0)
    if (msgLen > MAX_MSG) throw new Error('Message too large')
    if (buf.length < 4 + msgLen) return null

    const msg = buf.slice(4, 4 + msgLen)
    if (msg.length < 4) return null

    const nstr = msg.readUInt32LE(0)
    if (nstr > MAX_ARGS) throw new Error('Too many arguments')

    const args = []
    let pos = 4
    for (let i = 0; i < nstr; i++) {
      if (pos + 4 > msg.length) return null
      const len = msg.readUInt32LE(pos)
      pos += 4
      if (pos + len > msg.length) return null
      args.push(msg.slice(pos, pos + len).toString())
      pos += len
    }

    return { args, consumed: 4 + msgLen }
  }

  static writeNil() {
    const buf = Buffer.allocUnsafe(5)
    buf.writeUInt32LE(1, 0)
    buf.writeUInt8(TAG.NIL, 4)
    return buf
  }

  static writeStr(s) {
    const str = Buffer.from(s)
    const buf = Buffer.allocUnsafe(5 + str.length)
    buf.writeUInt32LE(1 + str.length, 0)
    buf.writeUInt8(TAG.STR, 4)
    str.copy(buf, 5)
    return buf
  }

  static writeErr(code, msg) {
    const m = Buffer.from(msg)
    const buf = Buffer.allocUnsafe(9 + m.length)
    buf.writeUInt32LE(5 + m.length, 0)
    buf.writeUInt8(TAG.ERR, 4)
    buf.writeUInt32LE(code, 5)
    m.copy(buf, 9)
    return buf
  }

  static writeInt(n) {
    const buf = Buffer.allocUnsafe(13)
    buf.writeUInt32LE(9, 0)
    buf.writeUInt8(TAG.INT, 4)
    buf.writeBigInt64LE(BigInt(n), 5)
    return buf
  }

  static writeDbl(d) {
    const buf = Buffer.allocUnsafe(13)
    buf.writeUInt32LE(9, 0)
    buf.writeUInt8(TAG.DBL, 4)
    buf.writeDoubleBE(d, 5)
    return buf
  }

  static writeArrHeader(n) {
    const buf = Buffer.allocUnsafe(9)
    buf.writeUInt32LE(5, 0)
    buf.writeUInt8(TAG.ARR, 4)
    buf.writeUInt32LE(n, 5)
    return buf
  }
}
