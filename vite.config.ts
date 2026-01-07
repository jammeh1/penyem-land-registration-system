import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/penyem-land-registration-system/',
  plugins: [react()],
});

