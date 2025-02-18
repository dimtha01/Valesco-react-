import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Puerto predeterminado para el servidor de desarrollo
    open: true, // Abrir automáticamente el navegador al iniciar el servidor
  },
  resolve: {
    alias: {
      '@': '/src', // Alias para importar archivos desde /src
    },
  },
});