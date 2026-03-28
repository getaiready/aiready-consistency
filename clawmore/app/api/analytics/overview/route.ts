import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { createLogger } from '../../../../lib/logger';

const log = createLogger('analytics');

const dbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-southeast-2',
});
const docClient = DynamoDBDocument.from(dbClient);
const TableName = process.env.DYNAMO_TABLE || '';

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user.email;

    // Find user
    const userRes = await docClient.query({
      TableName,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK = :sk',
      ExpressionAttributeValues: {
        ':pk': 'USER',
        ':sk': userEmail,
      },
    });

    const userItem = userRes.Items?.[0];
    if (!userItem) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userItem.PK.replace('USER#', '');

    // Get user metadata (credits, plan)
    const metaRes = await docClient.get({
      TableName,
      Key: { PK: `USER#${userId}`, SK: 'METADATA' },
    });
    const metadata = metaRes.Item || {};

    // Get connected repos with stats
    const reposRes = await docClient.query({
      TableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':prefix': 'REPO#',
      },
    });

    const repos = reposRes.Items || [];
    const totalScans = repos.reduce((sum, r) => sum + (r.scanCount || 0), 0);
    const totalFixes = repos.reduce((sum, r) => sum + (r.fixCount || 0), 0);

    // Get recent scan activity (mutations)
    const mutationsRes = await docClient.query({
      TableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':prefix': 'MUTATION#',
      },
      ScanIndexForward: false,
      Limit: 20,
    });

    const recentActivity = (mutationsRes.Items || []).map((item) => ({
      id: item.mutationId,
      type: item.mutationType,
      status: item.mutationStatus,
      repo: item.repoName,
      createdAt: item.createdAt,
    }));

    return NextResponse.json({
      plan: userItem.plan || 'FREE',
      status: userItem.status,
      credits: {
        balance: metadata.aiTokenBalanceCents || 0,
        refillThreshold: metadata.aiRefillThresholdCents || 100,
        autoTopupEnabled: metadata.autoTopupEnabled ?? true,
      },
      usage: {
        totalScans,
        totalFixes,
        repoCount: repos.length,
      },
      repos: repos.map((r) => ({
        id: r.repoId,
        name: r.repoName,
        url: r.repoUrl,
        branch: r.branch,
        status: r.status,
        scanCount: r.scanCount || 0,
        fixCount: r.fixCount || 0,
        lastScanAt: r.lastScanAt,
      })),
      recentActivity,
    });
  } catch (error) {
    log.error({ err: error }, 'Failed to load analytics');
    return NextResponse.json(
      { error: 'Failed to load analytics' },
      { status: 500 }
    );
  }
}
