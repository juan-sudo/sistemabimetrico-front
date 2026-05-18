import { NextResponse } from "next/server"

const API_BASE = (
  process.env.SERVER_API_URL ||
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "")
const ACCESS_COOKIE = "sb_access_token"
const REFRESH_COOKIE = "sb_refresh_token"
const IS_PROD = process.env.NODE_ENV === "production"

export function getAuthCookies() {
  return {
    access: ACCESS_COOKIE,
    refresh: REFRESH_COOKIE,
  }
}

export function getApiBase() {
  return API_BASE
}

export async function readJsonSafe(response: Response) {
  return response.json().catch(() => ({}))
}

export async function setSessionCookies(response: NextResponse, access: string, refresh: string) {
  const maxAccessAge = 30 * 60
  const maxRefreshAge = 7 * 24 * 60 * 60

  response.cookies.set(ACCESS_COOKIE, access, {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PROD,
    path: "/",
    maxAge: maxAccessAge,
  })
  response.cookies.set(REFRESH_COOKIE, refresh, {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PROD,
    path: "/",
    maxAge: maxRefreshAge,
  })

  return response
}

export async function clearSessionCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PROD,
    path: "/",
    maxAge: 0,
  })
  response.cookies.set(REFRESH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PROD,
    path: "/",
    maxAge: 0,
  })
  return response
}
