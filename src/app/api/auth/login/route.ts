import { NextResponse } from "next/server";
import { loginWithSingleDevice } from "@/lib/server-db";
import type { UserRole } from "@/types/student";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      role?: UserRole;
      username?: string;
      secret?: string;
      deviceId?: string;
      deviceLabel?: string;
    };

    if (
      (body.role !== "student" && body.role !== "admin") ||
      !body.username ||
      !body.secret ||
      !body.deviceId
    ) {
      return NextResponse.json(
        { ok: false, error: "Data login tidak lengkap." },
        { status: 400 }
      );
    }

    const result = await loginWithSingleDevice({
      role: body.role,
      username: body.username,
      secret: body.secret,
      deviceId: body.deviceId,
      deviceLabel: body.deviceLabel ?? "Perangkat Web",
    });

    if (!result.ok) {
      return NextResponse.json(result, { status: 401 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Gagal memproses login." },
      { status: 500 }
    );
  }
}
