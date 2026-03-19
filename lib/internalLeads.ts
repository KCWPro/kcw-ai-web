export type LeadStatus =
  | "new"
  | "follow_up"
  | "quoted"
  | "scheduled"
  | "completed"
  | "archived";

export type KcwLead = {
  id: string;
  customer_name: string;
  phone: string;
  city: string;
  service_type: string;
  urgency: "low" | "medium" | "high";
  source: "website" | "call" | "referral" | "google_ads";
  status: LeadStatus;
  created_at: string;
  preferred_visit_window: string;
  intake_raw: string;
  ai_summary: string;
  suggested_next_step: string;
  internal_notes: string;
};

export const internalLeads: KcwLead[] = [
  {
    id: "lead-1001",
    customer_name: "Michael Torres",
    phone: "(916) 555-0182",
    city: "Sacramento",
    service_type: "Emergency leak repair",
    urgency: "high",
    source: "website",
    status: "follow_up",
    created_at: "2026-03-17 08:15",
    preferred_visit_window: "ASAP - today",
    intake_raw:
      "Customer reported active leak under kitchen sink. Water spreading into cabinet and floor. Needs immediate response before lunch.",
    ai_summary:
      "Active residential leak with property damage risk. High intent and strong urgency. Recommend same-day dispatch.",
    suggested_next_step:
      "Call within 5 minutes, confirm address, and assign nearest on-call technician.",
    internal_notes:
      "Potential upsell: replace aging shutoff valve during repair.",
  },
  {
    id: "lead-1002",
    customer_name: "Sarah Nguyen",
    phone: "(530) 555-0109",
    city: "Roseville",
    service_type: "Water heater replacement quote",
    urgency: "medium",
    source: "google_ads",
    status: "quoted",
    created_at: "2026-03-17 09:02",
    preferred_visit_window: "This week, after 3 PM",
    intake_raw:
      "Current 50-gallon heater is 14 years old and inconsistent. Customer wants options for efficient replacement.",
    ai_summary:
      "Warm lead comparing options. Price sensitivity moderate; interested in efficiency and warranty.",
    suggested_next_step:
      "Send tiered quote (standard vs high-efficiency) and schedule on-site validation.",
    internal_notes:
      "Mention financing partner and 10-year warranty bundle.",
  },
  {
    id: "lead-1003",
    customer_name: "Robert Chen",
    phone: "(925) 555-0166",
    city: "Elk Grove",
    service_type: "Drain cleaning",
    urgency: "medium",
    source: "call",
    status: "follow_up",
    created_at: "2026-03-16 16:44",
    preferred_visit_window: "Tomorrow morning",
    intake_raw:
      "Slow drainage in two bathrooms and occasional backup smell. Wants estimate before committing.",
    ai_summary:
      "Likely partial main line blockage. Not emergency yet but risk increasing.",
    suggested_next_step:
      "Follow up with camera inspection offer and availability window.",
    internal_notes:
      "Prior caller. Could convert quickly with bundled service discount.",
  },
  {
    id: "lead-1004",
    customer_name: "Angela Brooks",
    phone: "(209) 555-0137",
    city: "Stockton",
    service_type: "Sewer line inspection",
    urgency: "low",
    source: "referral",
    status: "scheduled",
    created_at: "2026-03-15 11:20",
    preferred_visit_window: "Friday 10 AM - 12 PM",
    intake_raw:
      "Recent home purchase. Wants preventive sewer camera inspection and report for records.",
    ai_summary:
      "Planned maintenance lead from referral. High trust source, low urgency.",
    suggested_next_step:
      "Confirm appointment and send pre-visit checklist by SMS.",
    internal_notes:
      "Referred by repeat customer #C-441. Good long-term account potential.",
  },
  {
    id: "lead-1005",
    customer_name: "Daniel Patel",
    phone: "(510) 555-0195",
    city: "Folsom",
    service_type: "Pipe reroute consultation",
    urgency: "low",
    source: "website",
    status: "new",
    created_at: "2026-03-17 10:48",
    preferred_visit_window: "Next Monday",
    intake_raw:
      "Remodeling kitchen and needs guidance on moving supply lines. Looking for consult + quote.",
    ai_summary:
      "Project-based opportunity with higher ticket potential. Timeline flexible.",
    suggested_next_step:
      "Book site consultation and request remodel plan photos in advance.",
    internal_notes:
      "Flag for senior estimator due to layout complexity.",
  },
  {
    id: "lead-1006",
    customer_name: "Lisa Hernandez",
    phone: "(707) 555-0113",
    city: "Vacaville",
    service_type: "Emergency slab leak",
    urgency: "high",
    source: "call",
    status: "completed",
    created_at: "2026-03-14 07:36",
    preferred_visit_window: "Immediate",
    intake_raw:
      "Hot water pressure dropped suddenly; hearing water movement under floor. Requested emergency diagnostic.",
    ai_summary:
      "Previously urgent case resolved same day. Good candidate for maintenance plan offer.",
    suggested_next_step:
      "Send completion follow-up and annual plumbing inspection offer.",
    internal_notes:
      "Technician notes: repaired pinhole leak in copper line, no further seepage detected.",
  },
];

export const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  follow_up: "Waiting Follow-up",
  quoted: "Quoted",
  scheduled: "Scheduled",
  completed: "Completed",
  archived: "Archived",
};

export function getLeadById(id: string) {
  return internalLeads.find((lead) => lead.id === id);
}
