import { NextRequest, NextResponse } from 'next/server'

const AUTH_COOKIE = 'fp_auth'
const LOGIN_PATH = '/login'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === LOGIN_PATH) return NextResponse.next()

  const cookie = request.cookies.get(AUTH_COOKIE)
  if (cookie?.value === process.env.DASHBOARD_PASSWORD) {
    return NextResponse.next()
  }

  const loginUrl = new URL(LOGIN_PATH, request.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
