// Transparent reverse proxy for same-origin Better Editor preview.
//
// Puts the Payload admin (:3001) and the Bioscope frontend (:3000) behind ONE
// origin (:8080) so the preview iframe is same-origin with the admin (required
// by Better Editor click-to-edit). Unlike Next.js `rewrites`, this pipes the
// raw HTTP stream, so App Router hydration (RSC bootstrap) is preserved.
//
//   /admin, /api, /media  → CMS  (:3001)
//   /_next                → routed by Referer (admin page → CMS, else → frontend)
//   everything else       → frontend (:3000)
//
// Run:  node scripts/preview-proxy.mjs   (after both dev servers are up)
// Then open the admin at  http://localhost:8080/admin

import http from 'node:http'

const PORT = Number(process.env.PREVIEW_PROXY_PORT || 8080)
const CMS = { host: '127.0.0.1', port: Number(process.env.CMS_PORT || 3001) }
const FE = { host: '127.0.0.1', port: Number(process.env.FE_PORT || 3000) }

// Routing (dev — Next ignores assetPrefix so both apps share /_next):
//   /admin, /api, /media  → CMS
//   /_next                → by Referer (admin page → CMS, else → frontend)
//   everything else       → frontend
const cmsPath = (url) => /^\/(admin|api|media|favicon\.ico|robots\.txt|sitemap)/.test(url)

function route(url, headers = {}) {
  if (cmsPath(url)) return { target: CMS, path: url }
  if (url.startsWith('/_next')) {
    const ref = headers.referer || ''
    // strip origin, keep pathname, then test for the admin route prefix
    const refPath = ref.replace(/^https?:\/\/[^/]+/, '')
    return { target: /^\/admin(\/|$|\?)/.test(refPath) ? CMS : FE, path: url }
  }
  return { target: FE, path: url }
}

const server = http.createServer((req, res) => {
  const { target, path } = route(req.url, req.headers)
  const proxyReq = http.request(
    {
      host: target.host,
      port: target.port,
      method: req.method,
      path,
      headers: { ...req.headers, host: `${target.host}:${target.port}` },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers)
      proxyRes.pipe(res)
    },
  )
  proxyReq.on('error', (err) => {
    if (!res.headersSent) res.writeHead(502, { 'content-type': 'text/plain' })
    res.end(`[preview-proxy] upstream error: ${err.message}`)
  })
  req.pipe(proxyReq)
})

// Proxy WebSocket upgrades (Next dev HMR) to the same target.
server.on('upgrade', (req, socket, head) => {
  const { target, path } = route(req.url, req.headers)
  const proxyReq = http.request({
    host: target.host,
    port: target.port,
    method: req.method,
    path,
    headers: { ...req.headers, host: `${target.host}:${target.port}` },
  })
  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    const head =
      `HTTP/1.1 101 Switching Protocols\r\n` +
      Object.entries(proxyRes.headers)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join('\r\n') +
      '\r\n\r\n'
    socket.write(head)
    if (proxyHead?.length) proxySocket.unshift(proxyHead)
    proxySocket.pipe(socket).pipe(proxySocket)
  })
  proxyReq.on('error', () => socket.destroy())
  proxyReq.end()
})

server.listen(PORT, () => {
  console.log(`[preview-proxy] http://localhost:${PORT}  →  admin :${CMS.port} · frontend :${FE.port}`)
  console.log(`[preview-proxy] open the admin at  http://localhost:${PORT}/admin`)
})
