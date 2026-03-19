import { google } from 'googleapis';

type GoogleApiErrorShape = {
  code?: number;
  message?: string;
  response?: {
    status?: number;
    data?: {
      error?: {
        message?: string;
      };
    };
  };
};

export type StoredLead = {
  id: string;
  created_at: string;
  status: string;
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
  internal_notes: string;
  last_updated_at: string;
};

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
};

const INTERNAL_LEADS_RANGE = 'internal_leads!A:P';
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

function normalizeSpreadsheetId(rawSpreadsheetId: string): string {
  const trimmed = rawSpreadsheetId.trim();
  if (!trimmed) {
    throw new Error('Missing GOOGLE_SHEETS_SPREADSHEET_ID');
  }

  const regexMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (regexMatch?.[1]) {
    return regexMatch[1];
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsedUrl = new URL(trimmed);
      const pathMatch = parsedUrl.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (pathMatch?.[1]) {
        return pathMatch[1];
      }
    } catch {
      // Fall through to plain-id parsing below.
    }
  }

  return trimmed.split('?')[0].split('#')[0].split('/')[0].trim();
}

function tryParseJson(raw: string): { client_email?: string; private_key?: string } | null {
  try {
    return JSON.parse(raw) as { client_email?: string; private_key?: string };
  } catch {
    return null;
  }
}

function maybeBase64Decode(raw: string): string | null {
  const candidate = raw.trim();
  const base64Like = /^[A-Za-z0-9+/=\r\n]+$/.test(candidate) && candidate.length % 4 === 0;

  if (!base64Like || candidate.includes('{')) {
    return null;
  }

  try {
    const decoded = Buffer.from(candidate, 'base64').toString('utf8');
    return decoded.includes('{') ? decoded : null;
  } catch {
    return null;
  }
}

function parseServiceAccountJson(rawJson: string): ServiceAccountCredentials {
  const trimmed = rawJson.trim();
  const unwrapped = trimmed.replace(/^['"]|['"]$/g, '');

  const parsed =
    tryParseJson(rawJson) ||
    tryParseJson(trimmed) ||
    tryParseJson(unwrapped) ||
    (() => {
      const decoded = maybeBase64Decode(unwrapped);
      return decoded ? tryParseJson(decoded) : null;
    })();

  if (!parsed?.client_email) {
    throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON_V2: missing client_email');
  }

  if (!parsed.private_key) {
    throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON_V2: missing private_key');
  }

  return {
    client_email: parsed.client_email,
    private_key: parsed.private_key.replace(/\\n/g, '\n'),
  };
}

function mapGoogleSheetsError(error: unknown, action: string): Error {
  const err = error as GoogleApiErrorShape;
  const status = err?.response?.status ?? err?.code;
  const remoteMessage = err?.response?.data?.error?.message || err?.message || 'Unknown Google Sheets error';

  if (status === 400) {
    return new Error(`${action} failed: invalid request (400). ${remoteMessage}`);
  }

  if (status === 401 || status === 403) {
    return new Error(
      `${action} failed: permission denied (${status}). Check service account roles and sheet sharing. ${remoteMessage}`,
    );
  }

  if (status === 404) {
    return new Error(`${action} failed: spreadsheet or tab not found (404). Check normalized spreadsheet ID and tab name. ${remoteMessage}`);
  }

  return new Error(`${action} failed: ${remoteMessage}`);
}

async function getSheetsClient() {
  const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_V2;
  if (!rawJson) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON_V2');
  }

  const rawSpreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!rawSpreadsheetId) {
    throw new Error('Missing GOOGLE_SHEETS_SPREADSHEET_ID');
  }

  const spreadsheetId = normalizeSpreadsheetId(rawSpreadsheetId);
  const credentials = parseServiceAccountJson(rawJson);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [SHEETS_SCOPE],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return { sheets, spreadsheetId, clientEmail: credentials.client_email };
}

function toStoredLead(row: string[]): StoredLead {
  return {
    id: row[0] || '',
    created_at: row[1] || '',
    status: row[2] || 'new',
    customer_name: row[3] || '',
    phone: row[4] || '',
    city: row[5] || '',
    service_type: row[6] || '',
    urgency: row[7] || '',
    property_type: row[8] || '',
    source: row[9] || '',
    quote_amount: row[10] || '',
    problem_duration: row[11] || '',
    customer_notes: row[12] || '',
    ai_summary: row[13] || '',
    internal_notes: row[14] || '',
    last_updated_at: row[15] || '',
  };
}

function toRowValues(lead: StoredLead): string[] {
  return [
    lead.id,
    lead.created_at,
    lead.status,
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
    lead.internal_notes,
    lead.last_updated_at,
  ];
}

export async function appendInternalLeadToGoogleSheet(lead: StoredLead) {
  const { sheets, spreadsheetId } = await getSheetsClient();

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: INTERNAL_LEADS_RANGE,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [toRowValues(lead)],
      },
    });
  } catch (error: unknown) {
    throw mapGoogleSheetsError(error, 'Google Sheets append');
  }
}

export async function readInternalLeadsFromGoogleSheet(): Promise<StoredLead[]> {
  const { sheets, spreadsheetId } = await getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: INTERNAL_LEADS_RANGE,
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      return [];
    }

    return rows.slice(1).map((row) => toStoredLead(row));
  } catch (error: unknown) {
    throw mapGoogleSheetsError(error, 'Google Sheets read');
  }
}

export async function readInternalLeadByIdFromGoogleSheet(id: string) {
  const leads = await readInternalLeadsFromGoogleSheet();
  return leads.find((lead) => String(lead.id) === String(id));
}

export async function updateInternalLeadInGoogleSheet(id: string, updates: Partial<StoredLead>) {
  const { sheets, spreadsheetId } = await getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: INTERNAL_LEADS_RANGE,
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      throw new Error('No lead rows found in sheet');
    }

    const dataRows = rows.slice(1);
    const rowIndex = dataRows.findIndex((row) => String(row[0] || '') === String(id));

    if (rowIndex === -1) {
      throw new Error(`Lead with id ${id} not found`);
    }

    const currentLead = toStoredLead(dataRows[rowIndex]);
    const mergedLead: StoredLead = {
      ...currentLead,
      ...updates,
      id: currentLead.id,
      created_at: currentLead.created_at,
      last_updated_at: updates.last_updated_at || new Date().toISOString(),
    };

    const sheetRowNumber = rowIndex + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `internal_leads!A${sheetRowNumber}:P${sheetRowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [toRowValues(mergedLead)],
      },
    });

    return mergedLead;
  } catch (error: unknown) {
    throw mapGoogleSheetsError(error, 'Google Sheets update');
  }
}

export async function runGoogleSheetsConnectionDebug() {
  const { sheets, spreadsheetId, clientEmail } = await getSheetsClient();

  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });

    const preview = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: INTERNAL_LEADS_RANGE,
    });

    return {
      ok: true,
      spreadsheetId,
      clientEmail,
      range: INTERNAL_LEADS_RANGE,
      spreadsheetTitle: spreadsheet.data.properties?.title || '',
      headerRow: preview.data.values?.[0] || [],
      dataRowCount: Math.max(0, (preview.data.values?.length || 0) - 1),
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    throw mapGoogleSheetsError(error, 'Google Sheets debug check');
  }
}
