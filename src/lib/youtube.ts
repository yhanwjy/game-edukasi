export function extractYouTubeVideoId(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(
      trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
    );
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{6,15}$/.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const vParam = parsed.searchParams.get("v");
      if (vParam && /^[a-zA-Z0-9_-]{6,15}$/.test(vParam)) {
        return vParam;
      }

      const parts = parsed.pathname.split("/").filter(Boolean);
      if (
        (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") &&
        parts[1] &&
        /^[a-zA-Z0-9_-]{6,15}$/.test(parts[1])
      ) {
        return parts[1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function getYouTubeEmbedUrl(rawUrl: string): string | null {
  const id = extractYouTubeVideoId(rawUrl);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}?rel=0`;
}
