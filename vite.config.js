import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Habilitar historyApiFallback para manejar rutas del lado del cliente
    historyApiFallback: true,
  },
  build: {
    // Configuración de la carpeta de salida
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html', // Archivo principal
      },
    },
  },
});