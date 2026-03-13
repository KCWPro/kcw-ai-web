import { google } from 'googleapis';

const SHEET_NAME = 'Sheet1';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, status, quote_amount, appointment_date, follow_up_notes } = body;

    if (!id) {
      return Response.json(
        { success: false, message: 'Missing id' },
        { status: 400 }
      );
    }

    const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_V2;
    if (!rawJson) {
      throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON_V2');
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!spreadsheetId) {
      throw new Error('Missing GOOGLE_SHEETS_SPREADSHEET_ID');
    }

    const credentials = JSON.parse(rawJson);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A:P`,
    });

    const rows = readResponse.data.values || [];

    if (rows.length <= 1) {
      return Response.json(
        { success: false, message: 'No lead rows found in sheet' },
        { status: 404 }
      );
    }

    const dataRows = rows.slice(1);
    const rowIndex = dataRows.findIndex(
      (row) => String(row[0] || '') === String(id)
    );

    if (rowIndex === -1) {
      return Response.json(
        { success: false, message: `Lead with id ${id} not found` },
        { status: 404 }
      );
    }

    const sheetRowNumber = rowIndex + 2;

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: `${SHEET_NAME}!C${sheetRowNumber}`,
            values: [[status ?? '']],
          },
          {
            range: `${SHEET_NAME}!N${sheetRowNumber}:P${sheetRowNumber}`,
            values: [[
              quote_amount ?? '',
              appointment_date ?? '',
              follow_up_notes ?? '',
            ]],
          },
        ],
      },
    });

    return Response.json({
      success: true,
      message: 'Lead updated successfully',
    });
  } catch (error: any) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: error?.message || 'Failed to update lead',
      },
      { status: 500 }
    );
  }
}