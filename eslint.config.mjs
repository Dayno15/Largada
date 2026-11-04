import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Assets are compressed local files and data-URI previews. No image server is required.
  { rules: { '@next/next/no-img-element': 'off' } },
  globalIgnores(['out/**', '.next/**', 'next-env.d.ts', 'playwright-report/**', 'test-results/**']),
]);
