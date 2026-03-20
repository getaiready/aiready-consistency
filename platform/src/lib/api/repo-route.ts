import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRepository } from '@/lib/db';

type HandlerCtx = {
  request: NextRequest;
  params: { id: string };
  repo: any;
  session: any;
};

export async function withRepoAuth(
  request: NextRequest,
  paramsPromise: Promise<{ id: string }> | { id: string },
  handler: (ctx: HandlerCtx) => Promise<unknown>
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = (paramsPromise as any).then
      ? await paramsPromise
      : (paramsPromise as any);
    const repo = await getRepository(id);
    if (!repo) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }
    if (repo.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await handler({ request, params: { id }, repo, session });
    if (result instanceof NextResponse) return result;
    return NextResponse.json(result);
  } catch (err) {
    console.error('Repo route failed:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
