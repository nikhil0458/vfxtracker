import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})

// https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//     server: {
//       proxy: {
//         '/done_rpts': {
//           target: 'http://192.168.80.50:8001',
//           changeOrigin: true,
//           secure: false,
//         },
//       },
//     },
//   });
  

