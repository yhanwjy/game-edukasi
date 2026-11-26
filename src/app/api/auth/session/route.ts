import { NextResponse, connection } from "next/server";
import { logoutOnServer, validateSessionOnServer } from "@/lib/server-db";

export async function GET(request: Request) {
  await connection();
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId") ?? "";
  const accountKey = searchParams.get("accountKey") ?? "";
  const deviceId = searchParams.get("deviceId") ?? "";

  if (!sessionId || !accountKey || !deviceId) {
    return NextResponse.json({ valid: false, reason: "LOGGED_OUT" });
  }

  const result = await validateSessionOnServer({
    sessionId,
    accountKey,
    deviceId,
  });
  return NextResponse.json(result);
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as {
      sessionId?: string;
      accountKey?: string;
    };
    if (body.sessionId && body.accountKey) {
      await logoutOnServer({
        sessionId: body.sessionId,
        accountKey: body.accountKey,
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
