import { NextResponse } from "next/server"
import { getApiBase, readJsonSafe, setSessionCookies } from "../_lib"

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))

  let response: Response
  try {
    response = await fetch(`${getApiBase()}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    })
  } catch {
    return NextResponse.json(
      { detail: `No se pudo conectar al backend (${getApiBase()}).` },
      { status: 503 }
    )
  }

  const data = await readJsonSafe(response)
  if (!response.ok) {
    return NextResponse.json(data, { status: response.status })
  }

  const access = typeof data.access === "string" ? data.access : ""
  const refresh = typeof data.refresh === "string" ? data.refresh : ""

  const out = NextResponse.json(data)
  if (access && refresh) {
    await setSessionCookies(out, access, refresh)
  }
  return out
}
