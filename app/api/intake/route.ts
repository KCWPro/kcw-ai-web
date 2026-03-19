import OpenAI from 'openai';
import { appendInternalLeadToGoogleSheet, type StoredLead } from '@/lib/internalLeadsStore';

type IntakeBody = {
  customer_name?: string;
  phone?: string;
  city?: string;
  service_type?: string;
  urgency?: string;
  property_type?: string;
  source?: string;
  quote_amount?: string;
  problem_duration?: string;
  customer_notes?: string;
};

function buildPrompt(body: IntakeBody) {
  return `
You are the intake assistant for KCW Construction & Plumbing Inc.

Review this customer lead and return a professional internal summary.

Customer info:
- Name: ${body.customer_name || ''}
- Phone: ${body.phone || ''}
- City: ${body.city || ''}
- Service type: ${body.service_type || ''}
- Urgency: ${body.urgency || ''}
- Property type: ${body.property_type || ''}
- Source: ${body.source || 'unknown'}
- Quote amount: ${body.quote_amount || ''}
- Problem duration: ${body.problem_duration || ''}
- Notes: ${body.customer_notes || ''}

Please return in exactly this format:

Lead Quality: high / medium / low
Needs Visit: yes / no
Priority: urgent / normal / low
Summary: <write a short internal summary in English, under 100 words, and mention the source channel if provided>
`;
}

function buildFallbackSummary(body: IntakeBody) {
  const source = body.source || 'unknown';
  const city = body.city || 'unknown';
  const quoteAmount = body.quote_amount || 'not provided';

  return `Lead Quality: medium\nNeeds Visit: yes\nPriority: normal\nSummary: Manual fallback summary for ${body.customer_name || 'new lead'} in ${city} (${body.service_type || 'service request'}) from ${source}. Quote amount: ${quoteAmount}. Review intake details and call customer to confirm scope.`;
}

function validateBody(body: IntakeBody) {
  if (!body.customer_name?.trim()) {
    return 'Missing customer_name';
  }

  if (!body.phone?.trim()) {
    return 'Missing phone';
  }

  if (!body.service_type?.trim()) {
    return 'Missing service_type';
  }

  return null;
}

function maskPhone(phone: string | undefined) {
  if (!phone) {
    return '';
  }

  const trimmed = phone.trim();
  if (trimmed.length <= 4) {
    return trimmed;
  }

  return `${'*'.repeat(Math.max(0, trimmed.length - 4))}${trimmed.slice(-4)}`;
}

async function generateAiSummary(body: IntakeBody) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.info('[intake] OPENAI_API_KEY missing, using fallback summary');
    return buildFallbackSummary(body);
  }

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-5-mini',
    input: buildPrompt(body),
  });

  return response.output_text || buildFallbackSummary(body);
}

export async function POST(req: Request) {
  const requestId = `intake-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    const body: IntakeBody = await req.json();
    console.info('[intake] request received', {
      requestId,
      customer_name: body.customer_name || '',
      phone_masked: maskPhone(body.phone),
      city: body.city || '',
      service_type: body.service_type || '',
      source: body.source || 'website',
    });

    const validationError = validateBody(body);

    if (validationError) {
      console.warn('[intake] validation failed', { requestId, validationError });
      return Response.json({ success: false, message: validationError }, { status: 400 });
    }

    console.info('[intake] generating AI summary', { requestId });
    const aiSummary = await generateAiSummary(body);
    console.info('[intake] AI summary generated', {
      requestId,
      summary_length: aiSummary.length,
    });

    const now = new Date().toISOString();
    const lead: StoredLead = {
      id: `lead-${Date.now()}`,
      created_at: now,
      status: 'new',
      customer_name: body.customer_name || '',
      phone: body.phone || '',
      city: body.city?.trim() || 'Unknown',
      service_type: body.service_type || '',
      urgency: body.urgency || 'normal',
      property_type: body.property_type || '',
      source: body.source || 'website',
      quote_amount: body.quote_amount || '',
      problem_duration: body.problem_duration || '',
      customer_notes: body.customer_notes || '',
      ai_summary: aiSummary,
      internal_notes: '',
      last_updated_at: now,
    };

    console.info('[intake] appending lead to Google Sheets', {
      requestId,
      lead_id: lead.id,
      source: lead.source,
    });
    await appendInternalLeadToGoogleSheet(lead);
    console.info('[intake] lead appended to Google Sheets', {
      requestId,
      lead_id: lead.id,
    });

    return Response.json({
      success: true,
      result: aiSummary,
      lead,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong.';
    console.error('[intake] unhandled error', {
      requestId,
      message,
      error,
    });

    return Response.json({ success: false, message }, { status: 500 });
  }
}
