import OpenAI from 'openai';
import { saveLeadToFile } from '@/lib/saveLead';
import { appendLeadToGoogleSheet } from '@/lib/googleSheets';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const prompt = `
You are the intake assistant for KCW Construction & Plumbing Inc.

Review this customer lead and return a professional internal summary.

Customer info:
- Name: ${body.customer_name}
- Phone: ${body.phone}
- City: ${body.city}
- Service type: ${body.service_type}
- Urgency: ${body.urgency}
- Property type: ${body.property_type}
- Problem duration: ${body.problem_duration}
- Notes: ${body.customer_notes}

Please return in exactly this format:

Lead Quality: high / medium / low
Needs Visit: yes / no
Priority: urgent / normal / low
Summary: <write a short internal summary in English, under 100 words>
`;

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      input: prompt,
    });

    const resultText = response.output_text;

    const newLead = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      status: 'new',
      customer_name: body.customer_name,
      phone: body.phone,
      city: body.city,
      service_type: body.service_type,
      urgency: body.urgency,
      property_type: body.property_type,
      problem_duration: body.problem_duration,
      customer_notes: body.customer_notes,
      ai_result: resultText,
    };

    await saveLeadToFile(newLead);
    await appendLeadToGoogleSheet(newLead);

    return Response.json({
      success: true,
      result: resultText,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: 'Something went wrong.',
      },
      { status: 500 }
    );
  }
}
