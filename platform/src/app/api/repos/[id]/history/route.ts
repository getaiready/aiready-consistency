import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { listRepositoryAnalyses } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const repoId = id;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    const analyses = await listRepositoryAnalyses(repoId, limit + 5); // Fetch a few extra to account for filtering

    // Filter for completed scans or legacy records with valid scores
    const filtered = analyses
      .filter(
        (a) => a.status === 'completed' || (!a.status && (a.aiScore || 0) > 0)
      )
      .slice(0, limit);

    return NextResponse.json({ analyses: filtered });
  } catch (error) {
    console.error('Failed to fetch analysis history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
