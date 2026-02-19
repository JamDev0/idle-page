/**
 * GET /api/media — list media registry (spec §8.2).
 * POST /api/media/import — add media items (spec §8.2).
 */
import { NextRequest } from "next/server";
import { addMediaItems, readMediaRegistry } from "@/lib/media/registry";
import type { ImportItemInput } from "@/lib/media/registry";

export async function GET() {
  const registry = await readMediaRegistry();
  return Response.json(registry, { status: 200 });
}

interface ImportBody {
  items?: ImportItemInput[];
}

export async function POST(request: NextRequest) {
  let body: ImportBody = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const items = body.items;
  if (!Array.isArray(items) || items.length === 0) {
    return Response.json(
      { error: "Body must include non-empty items array" },
      { status: 400 }
    );
  }

  const valid: ImportItemInput[] = [];
  for (const item of items) {
    if (
      !item ||
      typeof item.source !== "string" ||
      typeof item.uri !== "string" ||
      !["local", "remote", "inline"].includes(item.source)
    ) {
      continue;
    }
    valid.push({
      type: item.type,
      source: item.source,
      uri: item.uri,
      title: item.title,
      durationHintMs: item.durationHintMs,
    });
  }

  if (valid.length === 0) {
    return Response.json(
      { error: "No valid items (source: local|remote|inline, uri: string)" },
      { status: 400 }
    );
  }

  const added = await addMediaItems(valid);
  return Response.json({ items: added }, { status: 201 });
}
