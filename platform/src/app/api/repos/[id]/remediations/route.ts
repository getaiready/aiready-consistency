import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { listRemediations } from '@/lib/db/remediation';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const remediations = await listRemediations(id);
    return NextResponse.json({ remediations });
  } catch (error) {
    console.error('[RemediationsAPI] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
