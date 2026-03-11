module.exports = {
  apps: [
    {
      name: 'jigwan-booking',
      script: 'node_modules/.bin/next',
      args: 'dev',
      cwd: __dirname,
      watch: false,
      autorestart: true,        // 크래시 시 자동 재시작
      max_restarts: 10,         // 최대 재시작 횟수
      restart_delay: 2000,      // 재시작 전 2초 대기
      max_memory_restart: '512M', // 메모리 512MB 초과 시 재시작
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      time: true
    }
  ]
};
