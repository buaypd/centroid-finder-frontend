import { defineConfig } from 'cypress';

// End-to-end tests run against the Vite dev server (`npm run dev`).
// The API is mocked with cy.intercept, so the Express server isn't needed.
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: false,
    video: false,
    screenshotOnRunFailure: false,
  },
});
