import { NextResponse } from "next/server";
import { deleteStudentInDb, updateStudentInDb } from "@/lib/server-db";
import type {
  EducationLevel,
  GameSession,
  ProctorReport,
  StageLevels,
} from "@/types/student";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as
      | {
          action: "patch";
          level?: EducationLevel;
          notes?: string;
          stageLevels?: Partial<StageLevels>;
        }
      | {
          action: "record_game";
          gameName: string;
          category: GameSession["category"];
          score: number;
          stars: 1 | 2 | 3;
          xpGain: number;
          minutesGain: number;
          proctor?: ProctorReport;
          advanceLetterStep?: number;
        };

    const updated = await updateStudentInDb(id, body);
    if (!updated) {
      return NextResponse.json(
        { ok: false, error: "Siswa tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, student: updated });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Gagal memperbarui data siswa." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deleted = await deleteStudentInDb(id);
    if (!deleted) {
      return NextResponse.json(
        { ok: false, error: "Siswa tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Gagal menghapus siswa." },
      { status: 500 }
    );
  }
}
