const path = require('path')

/** PM2 — frontend production, port 26000 */
module.exports = {
  apps: [
    {
      name: 'bioscope-web',
      cwd: path.join(__dirname, 'apps/bioscope-frontend'),
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 26000 -H 127.0.0.1',
      env: {
        NODE_ENV: 'production',
        PORT: '26000',
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '600M',
      error_file: path.join(__dirname, 'logs/pm2-bioscope-web-error.log'),
      out_file: path.join(__dirname, 'logs/pm2-bioscope-web-out.log'),
      merge_logs: true,
    },
  ],
}
