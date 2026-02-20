/**
 * POST /api/media/upload — upload files and add to registry (spec §8.2, §11.1).
 * Accepts multipart/form-data with "files" (multiple).
 * Saves under MEDIA_BASE_PATH with safe names; rejects unreadable or disallowed types.
 */
import { NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getMediaBasePath } from "@/lib/fs/hostPath";
import { addMediaItems } from "@/lib/media/registry";

const ALLOWED_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".avif",
  ".svg",
  ".mp4",
  ".webm",
  ".ogg",
  ".mov",
]);

function extFromName(name: string): string {
  const ext = path.extname(name).toLowerCase();
  return ext;
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const files = formData.getAll("files");
  if (!files || files.length === 0) {
    return Response.json(
      { error: "No files; use form field 'files' (multiple allowed)" },
      { status: 400 }
    );
  }

  const basePath = getMediaBasePath();
  await mkdir(basePath, { recursive: true });
  const inputs: { source: "local"; uri: string }[] = [];
  const rejected: { name: string; reason: string }[] = [];

  for (let i = 0; i < files.length; i++) {
    const entry = files[i];
    if (!entry || typeof entry !== "object" || !("name" in entry) || !("arrayBuffer" in entry)) {
      rejected.push({
        name: String(entry),
        reason: "Not a file",
      });
      continue;
    }
    const file = entry as File;
    const ext = extFromName(file.name);
    if (!ALLOWED_EXT.has(ext)) {
      rejected.push({
        name: file.name,
        reason: `Type not allowed; use one of: ${[...ALLOWED_EXT].join(", ")}`,
      });
      continue;
    }
    const safeName = `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
    const destPath = path.join(basePath, safeName);
    try {
      const buffer = await file.arrayBuffer();
      await writeFile(destPath, new Uint8Array(buffer));
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as Error).message)
          : "Write failed";
      rejected.push({ name: file.name, reason: message });
      continue;
    }
    inputs.push({ source: "local", uri: destPath });
  }

  if (inputs.length === 0) {
    return Response.json(
      {
        error: "No valid files uploaded",
        rejected: rejected.length ? rejected : undefined,
      },
      { status: 400 }
    );
  }

  const added = await addMediaItems(inputs);
  return Response.json(
    { items: added, rejected: rejected.length ? rejected : undefined },
    { status: 201 }
  );
}
