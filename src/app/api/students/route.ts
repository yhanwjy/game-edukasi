import { NextResponse, connection } from "next/server";
import {
  createStudentInDb,
  readDb,
  resetDemoDb,
} from "@/lib/server-db";
import type { StudentAccount } from "@/types/student";

export async function GET(request: Request) {
  await connection();
  const { searchParams } = new URL(request.url);
  const isPublic = searchParams.get("public") === "1";

  const db = await readDb();

  if (isPublic) {
    const quickAccounts = db.students.map((s) => ({
      id: s.id,
      name: s.name,
      username: s.username,
      level: s.level,
      avatarId: s.avatarId,
      pin: s.pin,
    }));
    return NextResponse.json({ accounts: quickAccounts });
  }

  return NextResponse.json({
    students: db.students,
    activeSessions: db.activeSessions,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as
      | { action: "reset" }
      | { action?: "create"; student: StudentAccount };

    if (body.action === "reset") {
      const students = await resetDemoDb();
      return NextResponse.json({ ok: true, students });
    }

    if (!("student" in body) || !body.student) {
      return NextResponse.json(
        { ok: false, error: "Payload siswa tidak valid." },
        { status: 400 }
      );
    }

    const result = await createStudentInDb(body.student);
    if (!result.ok) {
      return NextResponse.json(result, { status: 409 });
    }
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Gagal menyimpan data siswa." },
      { status: 500 }
    );
  }
}
