import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const rootDir = resolve(__dirname, '..', '..')
  const env = loadEnv(mode, rootDir, 'VITE_')

  Object.entries(env).forEach(([key, value]) => {
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  })

  const injectedEnv = Object.entries(env).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[`import.meta.env.${key}`] = JSON.stringify(value)
    return acc
  }, {})

  return {
    plugins: [react()],
    define: injectedEnv,
    server: {
      port: 5173,
      host: true
    }
  }
})
