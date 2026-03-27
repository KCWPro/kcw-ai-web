import type { ContentPillar, Topic } from "@/lib/contentOps/types";

const pillarMeta: Record<ContentPillar, { audience: string; angle: string; content_type: Topic["content_type"] }> = {
  common_issues: {
    audience: "SoCal homeowners with recurring plumbing issues",
    angle: "specific symptom + clear first check",
    content_type: "faq",
  },
  mistakes_to_avoid: {
    audience: "DIY-minded homeowners",
    angle: "wrong fix -> risk -> safer alternative",
    content_type: "myth",
  },
  real_case: {
    audience: "homeowners comparing repair options",
    angle: "what customer thought vs what was actually wrong",
    content_type: "real_case",
  },
  maintenance: {
    audience: "busy homeowners who want fewer emergencies",
    angle: "small monthly habit with practical payoff",
    content_type: "maintenance",
  },
  quote_education: {
    audience: "homeowners requesting estimates",
    angle: "how to read a plumbing quote without guessing",
    content_type: "education",
  },
  trust_knowledge: {
    audience: "homeowners evaluating contractor credibility",
    angle: "explain material/method trade-offs in plain language",
    content_type: "education",
  },
  brand_trust: {
    audience: "local viewers deciding who to call",
    angle: "field reality + calm recommendation",
    content_type: "education",
  },
  local_reminder: {
    audience: "older-home and seasonal-risk homeowners in SoCal",
    angle: "local condition reminder + preventive step",
    content_type: "education",
  },
};

const pillarTitles: Record<ContentPillar, string[]> = {
  common_issues: [
    "Kitchen sink drains slow after dinner? Check this before using chemicals",
    "Hot water turns cold in the shower after 5 minutes: top causes",
    "Toilet keeps running at night: quick homeowner check",
    "Outdoor main line leak signs most people miss",
    "Why does only one bathroom smell like sewer gas?",
    "Garbage disposal hums but won’t spin: what it usually means",
    "Laundry standpipe overflow during spin cycle: first 3 checks",
    "Water pressure dropped in one fixture only: where to look first",
    "Brown water for 10 seconds in the morning: when to worry",
    "Dishwasher backup into sink: symptom of branch drain problem",
    "Bathtub drains fine but toilet gurgles: likely vent/drain issue",
    "Pilot light keeps going out on older water heaters",
    "Recurring clog every 2 weeks means it’s probably not a simple clog",
  ],
  mistakes_to_avoid: [
    "Don’t pour boiling water into PVC drains for grease clogs",
    "Stop using multiple drain chemicals in one line",
    "Plunging a sink with overflow open: common DIY mistake",
    "Using too much force on shutoff valves can create a bigger leak",
    "Replacing a toilet wax ring without checking flange height",
    "Ignoring small ceiling stain under bathroom can turn into open-wall repair",
    "Using flex pipe under sink as permanent fix",
    "Wrapping gas fittings with wrong tape type",
    "Flushing ‘flushable’ wipes still causes main line blockages",
    "Running dishwasher with known slow drain is risky",
    "Skipping pressure test after small pipe repair",
    "Leaving hose bib dripping all season damages wall cavity",
    "Buying cheapest water heater without recovery-rate check",
  ],
  real_case: [
    "Customer thought it was a sink clog, but camera found root intrusion",
    "Small wall leak became cabinet-floor damage in 10 days",
    "Water heater looked repairable, but internal corrosion made replacement safer",
    "Toilet replacement quote changed after flange condition inspection",
    "Intermittent hot water traced to failing mixing valve",
    "Shower leak complaint ended up as upstairs drain crack",
    "Kitchen odor complaint resolved after vent correction",
    "Low pressure complaint solved by main regulator replacement",
    "Recurring laundry overflow fixed by cleanout access and jetting",
    "Slow-drain condo unit traced to shared stack restrictions",
    "Outdoor soggy patch diagnosis: hidden irrigation crossover plus plumbing leak",
    "Noisy pipes at night fixed through pressure balancing",
    "Old galvanized branch line created rust and poor flow",
  ],
  maintenance: [
    "Monthly 3-minute drain maintenance checklist for homeowners",
    "Before rainy season: check these outdoor drains and downspouts",
    "Vacation home restart checklist before using water fixtures",
    "Quarterly water heater sediment flush basics",
    "How to test your shutoff valves twice a year",
    "Simple under-sink leak check you can do with tissue",
    "Annual hose bib and exterior line inspection routine",
    "How to reduce grease-related kitchen clogs at home",
    "Garage laundry drain maintenance for older homes",
    "Preventive check before holiday guest season",
    "Water pressure gauge check to protect pipes and fixtures",
    "What to inspect after a minor earthquake tremor",
    "Apartment landlord handoff maintenance checklist",
  ],
  quote_education: [
    "Why two drain cleaning quotes can be very different",
    "What ‘access difficulty’ means on a plumbing estimate",
    "Why camera inspection may be recommended after unclogging",
    "Repair vs replace: how pros compare total cost over time",
    "When emergency pricing applies and what to ask",
    "How to compare warranty terms on plumbing proposals",
    "What is included in a standard water heater install quote",
    "Permit-related line items homeowners should understand",
    "Why material grade changes quote range",
    "What to ask before approving trench work",
    "How to read an estimate that includes drywall opening",
    "Why temporary fix option can still be worth listing",
    "Questions to ask if quote seems unusually low",
  ],
  trust_knowledge: [
    "Copper vs PEX in SoCal homes: practical decision points",
    "ABS vs cast iron drains: what changes in repair approach",
    "When hydro jetting is appropriate—and when it isn’t",
    "What a cleanout does and why access matters",
    "Pressure regulator basics in plain homeowner terms",
    "Tank vs tankless: what changes in maintenance",
    "Gas line shutoff awareness for homeowners",
    "How plumbers isolate leak source without guessing",
    "Why venting matters for drain performance",
    "What causes pipe hammer and how to reduce it",
    "Drain snake vs hydro jet: pros, limits, and risks",
    "Main line vs branch line—different symptoms",
    "How repipe projects are phased to reduce downtime",
  ],
  brand_trust: [
    "Day-on-the-job: 3 calls and how we prioritize safely",
    "Most common homeowner misunderstanding we see weekly",
    "Why we sometimes recommend waiting instead of rushing repair",
    "What we check before giving a same-day estimate",
    "How we communicate options without pressure",
    "Tool bag walkthrough: what each tool solves",
    "What a clean jobsite handoff looks like",
    "How we decide between spot repair and long-term fix",
    "Why photo documentation helps both sides",
    "Common call timing mistakes and better timing",
    "How we explain risks without fear-based selling",
    "What makes a repair ‘done right’ from our perspective",
    "How we handle follow-up after service",
  ],
  local_reminder: [
    "SoCal older-home pipe risk points to check this month",
    "Heat-wave season and water usage spikes: what to monitor",
    "Rainy week prep for outdoor drains and crawlspace",
    "Hard-water areas: signs your fixtures need attention",
    "If your home was built before 1980, inspect these plumbing zones",
    "Townhome shared-line reminder before holiday gatherings",
    "Condo stack issue warning signs for upper-floor units",
    "After heavy rain, inspect these 4 exterior areas",
    "Dry season foundation movement can stress older lines",
    "Landscape root growth season and main line backups",
    "Pre-winter water heater readiness checklist",
    "Rental turnover week: plumbing checks that prevent callbacks",
    "Neighborhood-specific reminder: alley cleanout access matters",
  ],
};

const formatCycle: Topic["format_recommendation"][] = [
  "faq_quick_answer",
  "dont_do_this",
  "problem_cause_fix",
  "before_after",
  "top_3_tips",
  "talking_head",
  "b_roll_subtitle",
  "local_service_reminder",
  "myth_busting",
  "quote_education",
];

const languageCycle: Topic["language"][] = ["en", "zh", "en_audio_zh_sub", "zh_audio_en_sub", "bilingual_caption"];

export const seedTopics: Topic[] = Object.entries(pillarTitles).flatMap(([pillarKey, titles], pillarIndex) => {
  const pillar = pillarKey as ContentPillar;
  const meta = pillarMeta[pillar];

  return titles.map((title, index) => {
    const id = `topic_${pillar}_${index + 1}`;
    const realismBase = pillar === "real_case" ? 92 : pillar === "brand_trust" ? 89 : 85;
    const leadBase = pillar === "real_case" || pillar === "quote_education" ? 82 : 70;
    const viralBase = pillar === "mistakes_to_avoid" || pillar === "common_issues" ? 78 : 68;

    return {
      id,
      title,
      pillar,
      angle: meta.angle,
      audience: meta.audience,
      platform: ["tiktok", "instagram_reels", "youtube_shorts"],
      language: languageCycle[(pillarIndex + index) % languageCycle.length],
      difficulty: index % 5 === 0 ? "easy" : index % 4 === 0 ? "hard" : "medium",
      asset_requirements: ["phone_vertical_9x16", "clear_audio", "one_real_scene"],
      trust_score: Math.min(98, realismBase + (index % 4)),
      viral_score: Math.min(95, viralBase + (index % 5)),
      lead_score: Math.min(96, leadBase + (index % 6)),
      realism_score: Math.min(99, realismBase + (index % 3)),
      ai_smell_risk: 12 + (index % 4),
      exaggeration_risk: 10 + (index % 3),
      duplication_risk: 18 + (index % 5),
      content_type: meta.content_type,
      funnel_stage: pillar === "quote_education" || pillar === "real_case" ? "lead_capture" : "awareness",
      format_recommendation: formatCycle[(pillarIndex + index) % formatCycle.length],
      case_eligible: pillar === "real_case" || pillar === "brand_trust",
      status: "approved",
    } satisfies Topic;
  });
});

export const seedTopicCount = seedTopics.length;
