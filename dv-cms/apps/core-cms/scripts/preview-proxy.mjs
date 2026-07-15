/**
 * Transparent same-origin proxy for the Better Editor preview.
 *
 * The Better Editor's click-to-edit reads the preview iframe's DOM, which the
 * browser only allows when the iframe is SAME ORIGIN as the admin. This proxy
 * serves both apps under one origin:
 *
 *   /admin, /api, /cms-static, /_payload            → CMS (Payload admin)
 *   everything else (frontend routes + /_next/*)    → frontend
 *
 * The CMS must run with CMS_ASSET_PREFIX=/cms-static so its client assets load
 * from /cms-static/_next and never collide with the frontend's /_next. Point the
 * admin domain (and PREVIEW_ORIGIN) at this proxy so admin + preview share origin.
 *
 * Env:
 *   PROXY_PORT       (default 3002)
 *   CMS_TARGET       (default http://localhost:3001)
 *   FRONTEND_TARGET  (default http://localhost:3000)
 *
 * No external dependencies (node:http only).
 */

import http from 'node:http'

const PORT = Number(process.env.PROXY_PORT || 3002)
const CMS_TARGET = process.env.CMS_TARGET || 'http://localhost:3001'
const FRONTEND_TARGET = process.env.FRONTEND_TARGET || 'http://localhost:3000'

// Path prefixes that belong to the CMS admin app.
const CMS_PREFIXES = ['/admin', '/api', '/cms-static', '/_payload', '/graphql-playground']

const isCms = (url) => CMS_PREFIXES.some((p) => url === p || url.startsWith(`${p}/`) || url.startsWith(`${p}?`))

/**
 * Resolve {target, path} for a request. The CMS runs with assetPrefix=/cms-static
 * so its HTML asks for /cms-static/_next/*, but Next serves those at /_next/* —
 * strip the /cms-static prefix when forwarding to the CMS.
 */
function route(url) {
  if (isCms(url)) {
    const path = url.startsWith('/cms-static') ? url.slice('/cms-static'.length) || '/' : url
    return { target: CMS_TARGET, path }
  }
  return { target: FRONTEND_TARGET, path: url }
}

const targetFor = (url) => route(url).target

function forward(clientReq, clientRes) {
  const { target, path } = route(clientReq.url)
  const t = new URL(target)
  const options = {
    protocol: t.protocol,
    hostname: t.hostname,
    port: t.port,
    method: clientReq.method,
    path,
    // Preserve the original Host (admin.bioscope.vn). Rewriting it to the target
    // host breaks Next 16's Server Action / RSC origin validation. Add the
    // standard forwarding headers instead.
    headers: {
      ...clientReq.headers,
      'x-forwarded-host': clientReq.headers.host,
      'x-forwarded-proto': clientReq.headers['x-forwarded-proto'] || 'https',
    },
  }

  const proxyReq = http.request(options, (proxyRes) => {
    clientRes.writeHead(proxyRes.statusCode || 502, proxyRes.headers)
    proxyRes.pipe(clientRes, { end: true })
  })

  proxyReq.on('error', (err) => {
    if (!clientRes.headersSent) clientRes.writeHead(502, { 'content-type': 'text/plain' })
    clientRes.end(`Preview proxy error: ${err.message}`)
  })

  clientReq.pipe(proxyReq, { end: true })
}

const server = http.createServer(forward)

// Proxy WebSocket upgrades (Next dev HMR) to the matching target.
server.on('upgrade', (req, socket, head) => {
  const { target, path } = route(req.url)
  const t = new URL(target)
  const proxyReq = http.request({
    hostname: t.hostname,
    port: t.port,
    path,
    method: req.method,
    headers: { ...req.headers },
  })
  proxyReq.on('upgrade', (proxyRes, proxySocket) => {
    socket.write(
      `HTTP/1.1 101 Switching Protocols\r\n${Object.entries(proxyRes.headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\r\n')}\r\n\r\n`,
    )
    proxySocket.write(head)
    proxySocket.pipe(socket)
    socket.pipe(proxySocket)
  })
  proxyReq.on('error', () => socket.destroy())
  proxyReq.end()
})

server.listen(PORT, () => {
  console.log(`[preview-proxy] listening on :${PORT}`)
  console.log(`  CMS      (${CMS_PREFIXES.join(', ')}) → ${CMS_TARGET}`)
  console.log(`  frontend (everything else)          → ${FRONTEND_TARGET}`)
})
