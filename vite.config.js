import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Ou como você estiver importando

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Garanta que o plugin do Tailwind está aqui
  ],

  // 👇 ADICIONE ESTA SEÇÃO 👇
  // Isso garante que config.css exista,
  // mesmo que você não precise de sourcemaps.
  css: {
    // Você pode definir como 'true' ou 'false'
    // O importante é que a chave 'css' exista.
    devSourcemap: true,
  },
})