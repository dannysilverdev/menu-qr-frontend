import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno basadas en el modo
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      // Exponer las variables de entorno para que estén disponibles en el código
      'import.meta.env': env,
    }
  }
})