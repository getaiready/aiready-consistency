import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';
import { createLogger } from '../../../../lib/logger';

const log = createLogger('onboarding');

const dbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-southeast-2',
});
const docClient = DynamoDBDocument.from(dbClient);
const TableName = process.env.DYNAMO_TABLE || '';

const connectSchema = z.object({
  repoUrl: z
    .string()
    .url('Invalid repository URL')
    .refine(
      (url) =>
        url.startsWith('https://github.com/') ||
        url.startsWith('http://github.com/'),
      'Must be a GitHub repository URL'
    ),
  repoName: z.string().min(1).max(100).optional(),
  branch: z.string().min(1).max(100).optional().default('main'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = connectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { repoUrl, branch } = parsed.data;
    const userEmail = session.user.email;

    // Extract owner/repo from URL
    const urlParts = repoUrl.replace(/\.git$/, '').split('/');
    const repoOwner = urlParts[urlParts.length - 2];
    const repoSlug = urlParts[urlParts.length - 1];
    const repoName = parsed.data.repoName || `${repoOwner}/${repoSlug}`;

    // Find user in DynamoDB
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

    // Check repo limit based on plan
    await docClient.get({
      TableName,
      Key: { PK: `USER#${userId}`, SK: 'METADATA' },
    });

    const plan = userItem.plan || 'FREE';
    const maxRepos = plan === 'FREE' ? 3 : plan === 'MANAGED' ? 10 : 50;

    // Count existing repos
    const reposRes = await docClient.query({
      TableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':prefix': 'REPO#',
      },
    });

    const currentRepoCount = reposRes.Items?.length || 0;
    if (currentRepoCount >= maxRepos) {
      return NextResponse.json(
        {
          error: `Repository limit reached (${maxRepos} for ${plan} plan). Upgrade to add more.`,
        },
        { status: 403 }
      );
    }

    // Check for duplicate repo
    const repoId = `${repoOwner}/${repoSlug}`;
    const existingRepo = reposRes.Items?.find((r) => r.repoId === repoId);
    if (existingRepo) {
      return NextResponse.json(
        { error: 'Repository already connected' },
        { status: 409 }
      );
    }

    // Store the repo connection
    const now = new Date().toISOString();
    await docClient.put({
      TableName,
      Item: {
        PK: `USER#${userId}`,
        SK: `REPO#${repoId}`,
        EntityType: 'ConnectedRepo',
        repoId,
        repoUrl,
        repoName,
        repoOwner,
        repoSlug,
        branch,
        status: 'ACTIVE',
        connectedAt: now,
        lastScanAt: null,
        scanCount: 0,
        fixCount: 0,
      },
    });

    log.info({ userId, repoId, repoUrl }, 'Repository connected');

    return NextResponse.json({
      success: true,
      repo: {
        id: repoId,
        name: repoName,
        url: repoUrl,
        branch,
        status: 'ACTIVE',
      },
    });
  } catch (error) {
    log.error({ err: error }, 'Failed to connect repository');
    return NextResponse.json(
      { error: 'Failed to connect repository' },
      { status: 500 }
    );
  }
}

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

    // Get connected repos
    const reposRes = await docClient.query({
      TableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':prefix': 'REPO#',
      },
    });

    const repos = (reposRes.Items || []).map((item) => ({
      id: item.repoId,
      name: item.repoName,
      url: item.repoUrl,
      branch: item.branch,
      status: item.status,
      connectedAt: item.connectedAt,
      lastScanAt: item.lastScanAt,
      scanCount: item.scanCount || 0,
      fixCount: item.fixCount || 0,
    }));

    return NextResponse.json({ repos });
  } catch (error) {
    log.error({ err: error }, 'Failed to list repositories');
    return NextResponse.json(
      { error: 'Failed to list repositories' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const repoId = searchParams.get('repoId');

    if (!repoId) {
      return NextResponse.json(
        { error: 'repoId is required' },
        { status: 400 }
      );
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

    // Delete the repo connection
    await docClient.delete({
      TableName,
      Key: { PK: `USER#${userId}`, SK: `REPO#${repoId}` },
    });

    log.info({ userId, repoId }, 'Repository disconnected');

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error({ err: error }, 'Failed to disconnect repository');
    return NextResponse.json(
      { error: 'Failed to disconnect repository' },
      { status: 500 }
    );
  }
}
