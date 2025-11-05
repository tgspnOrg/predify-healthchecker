import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    return NextResponse.json(session)
  } catch (error) {
    console.error("[v0] Session error:", error)
    return NextResponse.json(null)
  }
}
