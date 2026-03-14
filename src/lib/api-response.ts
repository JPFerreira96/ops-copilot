import { NextResponse } from "next/server"

export function apiErrorResponse(status: number, error: string, code?: string) {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(code ? { code } : {}),
    },
    { status },
  )
}