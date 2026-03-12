import { google } from 'googleapis';
import path from 'path';

export async function appendLeadToGoogleSheet(lead: any) {
  const keyFile = path.join(
    process.cwd(),
    process.env.GOOGLE_SERVICE_ACCOUNT_FILE || 'google-service-account.json'
  );

  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!spreadsheetId) {
    throw new Error('Missing GOOGLE_SHEETS_SPREADSHEET_ID');
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A:L',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        lead.id || '',
        lead.created_at || '',
        lead.status || '',
        lead.customer_name || '',
        lead.phone || '',
        lead.city || '',
        lead.service_type || '',
        lead.urgency || '',
        lead.property_type || '',
        lead.problem_duration || '',
        lead.customer_notes || '',
        lead.ai_result || '',
      ]],
    },
  });
}
