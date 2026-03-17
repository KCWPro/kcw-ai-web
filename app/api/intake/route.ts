import OpenAI from 'openai';
import { appendLeadToGoogleSheet } from '@/lib/googleSheets';

type IntakeBody = {
  customer_name?: string;
  phone?: string;
  service_address?: string;
  service_type?: string;
  urgency?: string;
  property_type?: string;
  source?: string;
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
  const urgency = body.urgency || 'normal';
  const source = body.source || 'unknown';
  return `Lead Quality: medium\nNeeds Visit: yes\nPriority: ${urgency}\nSummary: Manual fallback summary for ${body.customer_name || 'new lead'} (${body.service_type || 'service request'}) from ${source}. Review intake details and call customer to confirm scope.`;
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

export async function POST(req: Request) {
  try {
    const body: IntakeBody = await req.json();
    const resultText = await generateAiSummary(body);

    const newLead = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      status: 'new',
      customer_name: body.customer_name,
      phone: body.phone,
      service_address: body.service_address,
      service_type: body.service_type,
      urgency: body.urgency,
      property_type: body.property_type,
      source: body.source || '',
      problem_duration: body.problem_duration,
      customer_notes: body.customer_notes,
      ai_result: resultText,
    };

    await appendLeadToGoogleSheet(newLead);

    return Response.json({
      success: true,
      result: resultText,
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
