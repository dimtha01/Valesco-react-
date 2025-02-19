import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    // Habilitar historyApiFallback para manejar rutas del lado del cliente
    historyApiFallback: true,
  },
  build: {
    outDir: 'dist', // Carpeta de salida
    rollupOptions: {
      input: {
        main: 'index.html', // Archivo principal
      },
    },
  },
});