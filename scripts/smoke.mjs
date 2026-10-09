const base = process.env.SMOKE_BASE || 'http://localhost:3002'

function cookieFrom(res) {
  const list = res.headers.getSetCookie ? res.headers.getSetCookie() : []
  const single = res.headers.get('set-cookie')
  const all = list.length > 0 ? list : single ? [single] : []
  return all.map((value) => value.split(';')[0]).join('; ')
}

async function call(path, options = {}, cookie = '') {
  const headers = { 'content-type': 'application/json' }
  if (cookie) headers.cookie = cookie
  const res = await fetch(base + path, { ...options, headers })
  let body = null
  try {
    body = await res.json()
  } catch {
    body = null
  }
  return { res, body }
}

const email = 'ada@example.com'
const password = 'password1234'

let auth = await call('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({ email, password, displayName: 'Ada' }),
})
if (auth.res.status === 409) {
  auth = await call('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}
console.log('auth', auth.res.status, JSON.stringify(auth.body))

const cookie = cookieFrom(auth.res)
console.log('cookie-set', cookie ? 'yes' : 'no')

const me = await call('/api/me', {}, cookie)
console.log('me', me.res.status, JSON.stringify(me.body))

const memory = await call('/api/memory', {}, cookie)
console.log('memory', memory.res.status, JSON.stringify(memory.body))

const shared = await call('/api/shared', {}, cookie)
console.log('shared', shared.res.status, JSON.stringify(shared.body))

const guest = await call('/api/me', {})
console.log('me-no-cookie', guest.res.status, JSON.stringify(guest.body))
