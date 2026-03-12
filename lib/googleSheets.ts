import { google } from 'googleapis';

export async function appendLeadToGoogleSheet(lead: any) {
  const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_V2;

  if (!rawJson) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON_V2');
  }

  const credentials = JSON.parse(rawJson);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!spreadsheetId) {
    throw new Error('Missing GOOGLE_SHEETS_SPREADSHEET_ID');
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A:M',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        lead.id || '',
        lead.created_at || '',
        lead.status || '',
        lead.customer_name || '',
        lead.phone || '',
        lead.service_address || '',
        lead.service_type || '',
        lead.urgency || '',
        lead.property_type || '',
        lead.source || '',
        lead.problem_duration || '',
        lead.customer_notes || '',
        lead.ai_result || '',
      ]],
    },
  });
}
