import { NextRequest, NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { join } from 'path';

// Sanitize filename to prevent path traversal
function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_]/g, '_');
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const guid = searchParams.get('guid');
    const accountId = searchParams.get('accountId');
    const spaceName = searchParams.get('spaceName');

    if (!guid || !accountId || !spaceName) {
      return NextResponse.json(
        { error: 'Missing required parameters: guid, accountId, spaceName' },
        { status: 400 }
      );
    }

    // Construct filename
    const filename = `${guid}_${accountId}_${sanitizeName(spaceName)}.faiss`;

    // Check if file exists
    const dataDir = join(process.cwd(), 'data', 'embeddings');
    const filepath = join(dataDir, filename);
    const exists = existsSync(filepath);

    return NextResponse.json({
      exists,
      filename,
    });
  } catch (error) {
    console.error('Error checking embedding file:', error);
    return NextResponse.json(
      { error: 'Failed to check embedding file' },
      { status: 500 }
    );
  }
}
