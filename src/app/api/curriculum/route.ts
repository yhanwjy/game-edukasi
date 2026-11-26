import { NextResponse, connection } from "next/server";
import { getCustomLevels, saveCustomLevelConfig } from "@/lib/server-db";
import type { CustomLevelConfig } from "@/types/student";

export async function GET() {
  await connection();
  const customLevels = await getCustomLevels();
  return NextResponse.json({ customLevels });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { config?: CustomLevelConfig };
    if (
      !body.config ||
      !body.config.category ||
      typeof body.config.levelNumber !== "number"
    ) {
      return NextResponse.json(
        { ok: false, error: "Konfigurasi materi level tidak valid." },
        { status: 400 }
      );
    }

    const saved = await saveCustomLevelConfig(body.config);
    return NextResponse.json({ ok: true, config: saved });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Gagal menyimpan materi & soal level." },
      { status: 500 }
    );
  }
}
