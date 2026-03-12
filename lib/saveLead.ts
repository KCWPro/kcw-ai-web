import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'leads.json');

export async function saveLeadToFile(newLead: any) {
  let leads = [];

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    leads = JSON.parse(fileContent);
  } catch (error) {
    leads = [];
  }

  leads.push(newLead);

  await fs.writeFile(filePath, JSON.stringify(leads, null, 2), 'utf-8');
}
