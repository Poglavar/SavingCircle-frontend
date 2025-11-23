'use strict'

/**
 * Minimal browser-friendly stub for `thread-stream`.
 * It mimics the small subset of the API that libraries like `pino`
 * expect, without spawning workers or touching Node-specific modules.
 */
class ThreadStream {
  constructor () {
    this._events = new Map()
    this._closed = false
    this.worker = {
      exited: true,
      ref () {},
      unref () {},
    }

    // Emit a ready event on next tick to mirror real implementation.
    queueMicrotask(() => {
      this.emit('ready')
    })
  }

  on (event, handler) {
    const handlers = this._events.get(event) || []
    handlers.push(handler)
    this._events.set(event, handlers)
    return this
  }

  once (event, handler) {
    const wrapped = (...args) => {
      this.off(event, wrapped)
      handler(...args)
    }
    wrapped._original = handler
    return this.on(event, wrapped)
  }

  off (event, handler) {
    const handlers = this._events.get(event)
    if (!handlers) {
      return this
    }
    const idx = handlers.findIndex(
      (fn) => fn === handler || fn._original === handler,
    )
    if (idx >= 0) {
      handlers.splice(idx, 1)
      if (handlers.length === 0) {
        this._events.delete(event)
      }
    }
    return this
  }

  emit (event, ...args) {
    const handlers = this._events.get(event)
    if (!handlers || handlers.length === 0) {
      return false
    }
    handlers.slice().forEach((fn) => {
      fn(...args)
    })
    return true
  }

  write () {
    return true
  }

  flush (cb) {
    if (typeof cb === 'function') {
      cb()
    }
  }

  flushSync () {}

  end () {
    if (this._closed) {
      return
    }
    this._closed = true
    this.emit('close')
  }

  ref () {}

  unref () {}

  get closed () {
    return this._closed
  }
}

module.exports = ThreadStream
module.exports.default = ThreadStream

