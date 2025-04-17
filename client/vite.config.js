import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic'
  })],
  server: {
    host: true, // Allows access from other devices
    port: 5173, // Optional: Ensure the correct port is used
    proxy: {
      '/api': {
        target: 'http://localhost:3001/', // Backend server address
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Adjust as needed
      },
     
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      'react-bootstrap'
    ]
  }
})

// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [
//     react({
//       jsxRuntime: 'automatic',
//       babel: {
//         plugins: [
//           ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
//         ]
//       }
//     })
//   ],
//   optimizeDeps: {
//     include: [
//       'react',
//       'react-dom',
//       '@mui/material',
//       '@mui/icons-material',
//       'react-bootstrap'
//     ]
//   },
//   server: {
//         host: true, // Allows access from other devices
//         port: 5173, // Optional: Ensure the correct port is used
//         proxy: {
//           '/api': {
//             target: 'http://localhost:3001/', // Backend server address
//             changeOrigin: true,
//             rewrite: (path) => path.replace(/^\/api/, ''), // Adjust as needed
//           },
         
//         },
//       },
// });