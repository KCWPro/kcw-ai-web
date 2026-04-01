import { readSocialAutomationState } from "@/lib/socialAutomation/store";

export async function GET() {
  return Response.json({ success: true, snapshot: readSocialAutomationState() });
}
