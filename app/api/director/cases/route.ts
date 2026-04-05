import { NextResponse } from 'next/server';
import { createDirectorCase, listDirectorCases } from '@/lib/directorCasesStore';

export async function GET() {
  return NextResponse.json({ cases: listDirectorCases() });
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const created = createDirectorCase({
    title: typeof payload.title === 'string' ? payload.title : '',
    clientName: typeof payload.clientName === 'string' ? payload.clientName : '',
    address: typeof payload.address === 'string' ? payload.address : '',
    scopeSummary: typeof payload.scopeSummary === 'string' ? payload.scopeSummary : '',
  });

  return NextResponse.json({ case: created, redirectUrl: `/director/cases/${created.id}` }, { status: 201 });
}
