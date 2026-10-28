import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  workers: 1,
  use: {
    baseURL: 'http://localhost:3100',
    trace: 'retain-on-failure',
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    },
  },
  webServer: {
    command: 'npm run db:deploy && npm run dev -- --port 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      NEXT_DIST_DIR: '.next-e2e',
      DATABASE_URL: 'file:./prisma/e2e.db',
      APP_URL: 'http://localhost:3100',
      SMTP_HOST: '127.0.0.1',
      SMTP_PORT: '2526',
      SMTP_SECURE: 'false',
      SMTP_USER: '',
      SMTP_PASSWORD: '',
      MAIL_FROM: 'Santa <santa@example.com>',
      ORGANIZER_PASSWORD: 'test-organizer',
    },
  },
});
