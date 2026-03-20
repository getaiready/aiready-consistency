import { NextRequest, NextResponse } from 'next/server';
import { getIndustryBenchmarks } from '@/lib/db/benchmarks';
import { withRepoAuth } from '@/lib/api/repo-route';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRepoAuth(req, params, async ({ repo }) => {
    try {
      const benchmarks = await getIndustryBenchmarks(repo.id);

      if (!benchmarks) {
        return NextResponse.json(
          { error: 'Benchmark data unavailable' },
          { status: 404 }
        );
      }

      return { benchmarks };
    } catch (error) {
      console.error('[BenchmarksAPI] Error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  });
}
