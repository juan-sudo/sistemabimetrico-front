import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getApiBase, getAuthCookies, readJsonSafe } from "../_lib"

export async function GET() {
  const cookieStore = await cookies()
  const accessCookieName = getAuthCookies().access
  const access = cookieStore.get(accessCookieName)?.value || ""

  if (!access) {
    return NextResponse.json({ detail: "No autenticado." }, { status: 401 })
  }

  let response: Response
  try {
    response = await fetch(`${getApiBase()}/auth/me/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
      cache: "no-store",
    })
  } catch {
    return NextResponse.json(
      { detail: `No se pudo conectar al backend (${getApiBase()}).` },
      { status: 503 }
    )
  }

  const data = await readJsonSafe(response)
  return NextResponse.json(data, { status: response.status })
}
