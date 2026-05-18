import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getApiBase, getAuthCookies, readJsonSafe, setSessionCookies } from "../_lib"

export async function POST() {
  const cookieStore = await cookies()
  const refreshCookieName = getAuthCookies().refresh
  const refresh = cookieStore.get(refreshCookieName)?.value || ""

  if (!refresh) {
    return NextResponse.json({ detail: "No hay refresh token." }, { status: 401 })
  }

  let response: Response
  try {
    response = await fetch(`${getApiBase()}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
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
  const nextRefresh = typeof data.refresh === "string" ? data.refresh : refresh
  const out = NextResponse.json({ access, refresh: nextRefresh })
  if (access) {
    await setSessionCookies(out, access, nextRefresh)
  }
  return out
}
