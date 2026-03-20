import { NextRequest, NextResponse } from 'next/server';
import { getLatestAnalysis } from '@/lib/db';
import { getAnalysis, normalizeReport } from '@/lib/storage';
import { seedInitialRemediations } from '@/lib/db/seed-remediations';
import { withRepoAuth } from '@/lib/api/repo-route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRepoAuth(request, params, async ({ request, repo, session }) => {
    try {
      const latestAnalysisRecord = await getLatestAnalysis(repo.id);
      if (!latestAnalysisRecord || !latestAnalysisRecord.rawKey) {
        return NextResponse.json(
          {
            error: 'No analysis found for this repository',
            repo,
          },
          { status: 404 }
        );
      }

      // Seed initial remediations for alpha demo
      await seedInitialRemediations(repo.id, session.user.id);

      const fullAnalysis = await getAnalysis(latestAnalysisRecord.rawKey);
      if (!fullAnalysis) {
        return NextResponse.json(
          {
            error: 'Analysis details not found in storage',
            repo,
          },
          { status: 404 }
        );
      }

      // Normalize the report for the frontend (flattens issues, maps keys)
      // Force normalization to ensure we get the latest structure even if stored in an older format
      const normalizedAnalysis = normalizeReport(fullAnalysis, true);

      return {
        repo,
        analysis: normalizedAnalysis,
        timestamp: latestAnalysisRecord.timestamp,
      };
    } catch (error) {
      console.error('Error fetching latest analysis:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  });
}
