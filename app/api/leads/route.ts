import { google } from 'googleapis';

export async function GET() {
  try {
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
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:P',
    });

    const rows = response.data.values || [];

    if (rows.length <= 1) {
      return Response.json({
        success: true,
        leads: [],
      });
    }

    const dataRows = rows.slice(1);

    const leads = dataRows.map((row) => ({
      id: row[0] || '',
      created_at: row[1] || '',
      status: row[2] || 'new',
      customer_name: row[3] || '',
      phone: row[4] || '',
      service_address: row[5] || '',
      service_type: row[6] || '',
      urgency: row[7] || '',
      property_type: row[8] || '',
      source: row[9] || '',
      problem_duration: row[10] || '',
      customer_notes: row[11] || '',
      ai_result: row[12] || '',
      quote_amount: row[13] || '',
      appointment_date: row[14] || '',
      follow_up_notes: row[15] || '',
    }));

    return Response.json({
      success: true,
      leads,
    });
  } catch (error: any) {
    console.error(error);

    return Response.json({
      success: false,
      leads: [],
      message: error?.message || 'Failed to load leads',
    });
  }
}
