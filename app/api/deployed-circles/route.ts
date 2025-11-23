import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "lib", "deployedsavingcircles.txt")
    const content = await fs.readFile(filePath, "utf-8")
    const addresses = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
    return NextResponse.json({ addresses })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load deployed circles" },
      { status: 500 },
    )
  }
}


