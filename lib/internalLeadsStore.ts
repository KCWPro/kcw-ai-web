import { google } from 'googleapis';

export type StoredLead = {
  id: string;
  customer_name: string;
  phone: string;
  city: string;
  service_type: string;
  urgency: string;
  property_type: string;
  source: string;
  quote_amount: string;
  problem_duration: string;
  customer_notes: string;
  ai_summary: string;
  status: string;
  created_at: string;
};

async function getSheetsClient() {
  const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_V2;
  if (!rawJson) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON_V2');
  }

  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error('Missing GOOGLE_SHEETS_SPREADSHEET_ID');
  }

  const credentials = JSON.parse(rawJson) as Record<string, unknown>;

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return { sheets, spreadsheetId };
}

function toStoredLead(row: string[]): StoredLead {
  return {
    id: row[0] || '',
    customer_name: row[1] || '',
    phone: row[2] || '',
    city: row[3] || '',
    service_type: row[4] || '',
    urgency: row[5] || '',
    property_type: row[6] || '',
    source: row[7] || '',
    quote_amount: row[8] || '',
    problem_duration: row[9] || '',
    customer_notes: row[10] || '',
    ai_summary: row[11] || '',
    status: row[12] || 'new',
    created_at: row[13] || '',
  };
}

export async function appendInternalLeadToGoogleSheet(lead: StoredLead) {
  const { sheets, spreadsheetId } = await getSheetsClient();

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A:N',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        lead.id,
        lead.customer_name,
        lead.phone,
        lead.city,
        lead.service_type,
        lead.urgency,
        lead.property_type,
        lead.source,
        lead.quote_amount,
        lead.problem_duration,
        lead.customer_notes,
        lead.ai_summary,
        lead.status,
        lead.created_at,
      ]],
    },
  });
}

export async function readInternalLeadsFromGoogleSheet(): Promise<StoredLead[]> {
  const { sheets, spreadsheetId } = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:N',
  });

  const rows = response.data.values || [];
  if (rows.length <= 1) {
    return [];
  }

  return rows.slice(1).map((row) => toStoredLead(row));
}

export async function readInternalLeadByIdFromGoogleSheet(id: string) {
  const leads = await readInternalLeadsFromGoogleSheet();
  return leads.find((lead) => String(lead.id) === String(id));
}
