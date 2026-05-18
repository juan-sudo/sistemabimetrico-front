import { NextResponse } from "next/server"
import { clearSessionCookies } from "../_lib"

export async function POST() {
  const out = NextResponse.json({ ok: true })
  await clearSessionCookies(out)
  return out
}

