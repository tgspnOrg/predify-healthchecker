import { NextResponse } from "next/server"
import { getEndpoints } from "@/lib/storage"

export async function GET() {
  try {
    const allEndpoints = getEndpoints()

    const publicEndpoints = allEndpoints
      .filter((endpoint) => endpoint.publicVisible)
      .map((endpoint) => ({
        id: endpoint.id,
        name: endpoint.name,
        url: endpoint.url,
        environment: endpoint.environment,
        group: endpoint.group,
        description: endpoint.description,
        format: endpoint.format,
        lastCheck: endpoint.lastCheck,
      }))

    return NextResponse.json(publicEndpoints)
  } catch (error: any) {
    console.error("[v0] Public health API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
