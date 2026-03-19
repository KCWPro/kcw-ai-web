import { runGoogleSheetsConnectionDebug } from '@/lib/internalLeadsStore';

export async function GET() {
  try {
    const result = await runGoogleSheetsConnectionDebug();
    return Response.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Google Sheets debug check failed';

    return Response.json(
      {
        success: false,
        message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
