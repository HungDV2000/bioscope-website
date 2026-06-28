const path = require('path')

/** PM2 — frontend chạy nền, không tắt khi đóng SSH */
module.exports = {
  apps: [
    {
      name: 'bioscope-web',
      cwd: path.join(__dirname, 'apps/bioscope-frontend'),
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: '26000',
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '600M',
    },
  ],
}
