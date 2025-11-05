// import { handlers } from "@/lib/auth"

// export const { GET, POST } = handlers

import { handlers } from "@/lib/auth"

// ✅ Exporta explicitamente
export const GET = handlers.GET
export const POST = handlers.POST

// (opcional, se necessário para evitar Edge)
export const runtime = "nodejs"