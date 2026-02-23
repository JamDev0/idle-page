/**
 * POST /api/todo/checkpoint — attempt git commit for TODO file (spec §8.3).
 * Returns graceful unsupported/fallback signal if repo unavailable.
 */
import { NextRequest } from "next/server";
import { normalizeTodoFilePath } from "@/lib/fs/hostPath";
import { attemptCheckpoint } from "@/lib/git/checkpoint";

const FILE_PATH_PARAM = "filePath";

function getFilePath(request: NextRequest): string | null {
  const filePath = request.nextUrl.searchParams.get(FILE_PATH_PARAM);
  return filePath ? normalizeTodoFilePath(filePath) : null;
}

export async function POST(request: NextRequest) {
  const filePath = getFilePath(request);
  if (!filePath) {
    return Response.json(
      { error: "Missing or invalid filePath" },
      { status: 400 }
    );
  }

  const result = attemptCheckpoint(filePath);
  if (result.ok) {
    return Response.json(
      { checkpoint: "ok", message: result.message },
      { status: 200 }
    );
  }
  return Response.json(
    { checkpoint: "unsupported", reason: result.reason },
    { status: 200 }
  );
}
