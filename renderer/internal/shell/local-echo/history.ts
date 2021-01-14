/**
 * Shell history for localEcho
 */
export class History {

  size: number
  entries: string[]
  cursor: number

  constructor(size: number) {
    this.size = size
    this.entries = []
    this.cursor = 0
  }

  push(entry: string) {
    entry = entry.trim()
    if (!entry) return
    this.entries.push(entry)
    if (this.entries.length > this.size) {
      this.entries.shift()
    }
    this.rewind()
  }

  rewind() {
    this.cursor = this.entries.length
  }

  back() {
    const idx = Math.max(0, this.cursor - 1)
    this.cursor = idx
    return this.entries[idx]
  }

  forward() {
    const idx = Math.min(this.entries.length, this.cursor + 1)
    this.cursor = idx
    return this.entries[idx]
  }
}
