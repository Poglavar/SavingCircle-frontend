const MAX_CONCURRENT_REQUESTS = 3
const MIN_DELAY_BETWEEN_RELEASE_MS = 200

type Resolver = () => void

const queue: Resolver[] = []
let active = 0

const flushQueue = () => {
  while (active < MAX_CONCURRENT_REQUESTS && queue.length > 0) {
    const next = queue.shift()
    if (!next) continue
    active++
    next()
  }
}

const acquireSlot = async () => {
  if (active < MAX_CONCURRENT_REQUESTS) {
    active++
    return
  }

  await new Promise<void>((resolve) => {
    queue.push(resolve)
  })
}

const releaseSlot = () => {
  setTimeout(() => {
    active = Math.max(0, active - 1)
    flushQueue()
  }, MIN_DELAY_BETWEEN_RELEASE_MS)
}

export async function withRpcThrottle<T>(task: () => Promise<T>): Promise<T> {
  await acquireSlot()
  try {
    return await task()
  } finally {
    releaseSlot()
  }
}


