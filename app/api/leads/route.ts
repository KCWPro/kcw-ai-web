import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'leads.json');

export async function GET() {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const leads = JSON.parse(fileContent);

    return Response.json({
      success: true,
      leads,
    });
  } catch (error) {
    return Response.json({
      success: true,
      leads: [],
    });
  }
}
