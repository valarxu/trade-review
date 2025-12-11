module.exports = {
  apps: [
    {
      name: 'trade-review-api',
      script: 'server/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
}
