import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'leads.json');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    const fileContent = await fs.readFile(filePath, 'utf-8');
    const leads = JSON.parse(fileContent);

    const updatedLeads = leads.map((lead: any) => {
      if (lead.id === id) {
        return {
          ...lead,
          status,
        };
      }
      return lead;
    });

    await fs.writeFile(filePath, JSON.stringify(updatedLeads, null, 2), 'utf-8');

    return Response.json({
      success: true,
      message: 'Status updated successfully',
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: 'Failed to update status',
      },
      { status: 500 }
    );
  }
}
