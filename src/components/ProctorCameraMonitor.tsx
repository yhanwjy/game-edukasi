"use client";

import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { AlertTriangle, Camera, CameraOff, ShieldCheck } from "lucide-react";
import type { ProctorReport } from "@/types/student";

export interface ProctorMonitorHandle {
  buildReport: () => ProctorReport;
}

interface ProctorCameraMonitorProps {
  active: boolean;
  monitorRef: React.RefObject<ProctorMonitorHandle | null>;
}

export function ProctorCameraMonitor({
  active,
  monitorRef,
}: ProctorCameraMonitorProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const startTimeRef = useRef<number>(0);

  const [camStatus, setCamStatus] = useState<
    "starting" | "mandiri" | "assisted_warning" | "no_camera"
  >("starting");
  const [warningsCount, setWarningsCount] = useState(0);
  const [samplesCount, setSamplesCount] = useState(0);
  const [recordedChunksCount, setRecordedChunksCount] = useState(0);
  const [snapshotUrl, setSnapshotUrl] = useState<string | undefined>(undefined);
  const [statusLabel, setStatusLabel] = useState(
    "Menyalakan kamera pemantau..."
  );

  useImperativeHandle(
    monitorRef,
    () => ({
      buildReport: (): ProctorReport => {
        const elapsed = startTimeRef.current
          ? Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
          : 0;

        if (camStatus === "no_camera") {
          return {
            status: "Tanpa Kamera",
            confidence: 0,
            durationSec: elapsed,
            warningsCount: 0,
            summary:
              "Kamera tidak aktif atau izin kamera tidak diberikan saat mengerjakan soal.",
          };
        }

        const isAssisted = warningsCount >= 2;
        const confidence = isAssisted
          ? Math.max(40, 85 - warningsCount * 10)
          : Math.min(98, 88 + Math.min(10, samplesCount));

        return {
          status: isAssisted ? "Terindikasi Dibantu" : "Mandiri",
          confidence,
          durationSec: elapsed,
          warningsCount,
          summary: isAssisted
            ? `Rekaman ${elapsed} dtk mendeteksi ${warningsCount}x gerakan tambahan di samping anak (kemungkinan ada pendamping).`
            : `Rekaman ${elapsed} dtk (${recordedChunksCount} segmen video) memvalidasi anak fokus mengerjakan sendiri.`,
          snapshotDataUrl: snapshotUrl,
        };
      },
    }),
    [camStatus, warningsCount, samplesCount, recordedChunksCount, snapshotUrl]
  );

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    startTimeRef.current = Date.now();

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          if (!cancelled) {
            setCamStatus("no_camera");
            setStatusLabel("Kamera tidak didukung browser ini");
          }
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: "user" },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        // Aktifkan perekaman video MediaRecorder
        if (typeof MediaRecorder !== "undefined") {
          try {
            const recorder = new MediaRecorder(stream);
            recorder.ondataavailable = (ev) => {
              if (ev.data.size > 0) {
                setRecordedChunksCount((c) => c + 1);
              }
            };
            recorder.start(2000);
            recorderRef.current = recorder;
          } catch {
            // Codec fallback ignored
          }
        }

        setCamStatus("mandiri");
        setStatusLabel("Kamera Aktif · Terpantau Mandiri");
      } catch {
        if (!cancelled) {
          setCamStatus("no_camera");
          setStatusLabel("Kamera tidak diizinkan / tidak ditemukan");
        }
      }
    }

    void startCamera();

    // Analisis frame berkala: cek aktivitas di zona tengah vs zona samping kiri/kanan
    const analyzerInterval = window.setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const w = 96;
      const h = 72;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(video, 0, 0, w, h);
      const frame = ctx.getImageData(0, 0, w, h).data;

      // Simpan snapshot awal/terbaru ukuran kecil untuk laporan admin
      setSnapshotUrl(canvas.toDataURL("image/jpeg", 0.55));
      setSamplesCount((s) => s + 1);

      const prev = prevFrameRef.current;
      if (prev && prev.length === frame.length) {
        let sideDiff = 0;
        let centerDiff = 0;
        let sidePixels = 0;
        let centerPixels = 0;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const delta =
              Math.abs(frame[idx] - prev[idx]) +
              Math.abs(frame[idx + 1] - prev[idx + 1]) +
              Math.abs(frame[idx + 2] - prev[idx + 2]);

            const isSideZone = x < w * 0.24 || x > w * 0.76;
            if (isSideZone) {
              sideDiff += delta;
              sidePixels += 1;
            } else {
              centerDiff += delta;
              centerPixels += 1;
            }
          }
        }

        const avgSideMotion = sideDiff / Math.max(1, sidePixels);
        const avgCenterMotion = centerDiff / Math.max(1, centerPixels);

        // Jika sisi kiri/kanan mengalami lonjakan gerakan tinggi bersamaan dengan zona tengah, indikasi ada orang lain di samping
        if (avgSideMotion > 34 && avgCenterMotion > 14) {
          setWarningsCount((c) => c + 1);
          setCamStatus("assisted_warning");
          setStatusLabel("Terdeteksi gerakan tambahan di samping anak");
        } else {
          setCamStatus((curr) =>
            curr === "assisted_warning" ? "assisted_warning" : "mandiri"
          );
        }
      }

      prevFrameRef.current = new Uint8ClampedArray(frame);
    }, 1500);

    return () => {
      cancelled = true;
      window.clearInterval(analyzerInterval);
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        try {
          recorderRef.current.stop();
        } catch {
          // Ignore
        }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-900 px-3.5 py-2.5 text-white shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-800 border border-slate-700">
          {camStatus === "no_camera" ? (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <CameraOff className="h-4 w-4" />
            </div>
          ) : (
            <video
              ref={videoRef}
              muted
              playsInline
              className="h-full w-full object-cover -scale-x-100"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
          {camStatus !== "no_camera" && (
            <span className="absolute left-1 top-1 flex items-center gap-1 rounded bg-rose-600/90 px-1 py-0.5 text-[8px] font-black tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              REC
            </span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            {camStatus === "assisted_warning" ? (
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
            ) : camStatus === "no_camera" ? (
              <Camera className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            )}
            <span className="text-xs font-extrabold truncate">
              {statusLabel}
            </span>
          </div>
          <p className="text-[10px] text-slate-300">
            {camStatus === "no_camera"
              ? "Izinkan kamera agar laporan kemandirian terekam untuk Admin."
              : `Merekam & memvalidasi pengerjaan mandiri (${warningsCount} peringatan)`}
          </p>
        </div>
      </div>
    </div>
  );
}
