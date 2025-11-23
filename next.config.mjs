import { dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const threadStreamShim = fileURLToPath(
  new URL('./lib/shims/thread-stream.js', import.meta.url),
)

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
  },
  webpack: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'thread-stream': threadStreamShim,
    }

    config.resolve.fallback = {
      ...config.resolve.fallback,
      "why-is-node-running": false,
      tap: false,
    }
    return config
  },
}

export default nextConfig