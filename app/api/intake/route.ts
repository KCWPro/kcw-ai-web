import OpenAI from 'openai';
import { appendInternalLeadToGoogleSheet, type StoredLead } from '@/lib/internalLeadsStore';

type IntakeBody = {
  customer_name?: string;
  phone?: string;
  city?: string;
  service_address?: string;
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
- Service address: ${body.service_address || ''}
- Service type: ${body.service_type || ''}
- Urgency: ${body.urgency || ''}
- Property type: ${body.property_type || ''}
- Source: ${body.source || 'unknown'}
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
  return `Lead Quality: medium\nNeeds Visit: yes\nPriority: normal\nSummary: Manual fallback summary for ${body.customer_name || 'new lead'} (${body.service_type || 'service request'}) from ${source}. Review intake details and call customer to confirm scope.`;
}

async function generateAiSummary(body: IntakeBody) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return buildFallbackSummary(body);
  }

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-5-mini',
    input: buildPrompt(body),
  });

  return response.output_text || buildFallbackSummary(body);
}

function resolveCity(body: IntakeBody) {
  if (body.city?.trim()) {
    return body.city.trim();
  }

  if (body.service_address?.trim()) {
    return body.service_address.split(',')[0]?.trim() || 'Unknown';
  }

  return 'Unknown';
}

export async function POST(req: Request) {
  try {
    const body: IntakeBody = await req.json();
    const aiSummary = await generateAiSummary(body);

    const lead: StoredLead = {
      id: `lead-${Date.now()}`,
      customer_name: body.customer_name || '',
      phone: body.phone || '',
      city: resolveCity(body),
      service_type: body.service_type || '',
      urgency: body.urgency || 'normal',
      property_type: body.property_type || '',
      source: body.source || 'website',
      quote_amount: body.quote_amount || '',
      problem_duration: body.problem_duration || '',
      customer_notes: body.customer_notes || '',
      ai_summary: aiSummary,
      status: 'new',
      created_at: new Date().toISOString(),
    };

    await appendInternalLeadToGoogleSheet(lead);

    return Response.json({
      success: true,
      result: aiSummary,
      lead,
    });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Something went wrong.';

    return Response.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
